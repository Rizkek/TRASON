import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SmartInput, openSmartInput } from '@/components/SmartInput';
import { createReminderWithInvalidation, createTransactionWithInvalidation } from '@/libs/mutations';
import { ApiError } from '@/libs/apiErrors';

jest.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: () => ({ language: 'en', locale: 'en-US', timezone: 'UTC', currency: 'USD', module_features: {} }),
}));
jest.mock('@/libs/mutations', () => ({
  createTransactionWithInvalidation: jest.fn().mockResolvedValue({}),
  createActivityWithInvalidation: jest.fn().mockResolvedValue({}),
  createReminderWithInvalidation: jest.fn().mockResolvedValue({}),
}));

const PLACEHOLDER = /Spent 15 on lunch/;
const reply = (body: unknown, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({ ok, json: async () => body }) as unknown as typeof fetch;
};
const lunch = {
  action: 'create',
  type: 'transaction',
  confidence: 0.9,
  message: 'Lunch for 15',
  data: { title: 'Lunch', amount: 15, transactionType: 'expense', date: '2026-11-05' },
};
const open = () => act(() => openSmartInput());
const submit = (text: string) => {
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
};

describe('SmartInput', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is closed until opened', () => {
    render(<SmartInput />);
    expect(screen.queryByPlaceholderText(PLACEHOLDER)).not.toBeInTheDocument();
  });

  it('opens from a button anywhere, not only from the keyboard', () => {
    render(<SmartInput />);
    open();
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
  });

  it('still opens with Ctrl+K and closes with it again', () => {
    render(<SmartInput />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByPlaceholderText(PLACEHOLDER)).not.toBeInTheDocument();
  });

  it('cannot submit an empty sentence', () => {
    render(<SmartInput />);
    open();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('shows the draft as labelled rows, then saves it as a transaction', async () => {
    reply(lunch);
    render(<SmartInput />);
    open();
    submit('Spent 15 on lunch');

    expect(await screen.findByText('Lunch for 15')).toBeInTheDocument();
    expect(screen.getByText('transaction type')).toBeInTheDocument();
    expect(screen.getByText('expense')).toBeInTheDocument();
    expect(screen.queryByText(/"title"/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(createTransactionWithInvalidation).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Lunch', amount: 15, type: 'expense', date: '2026-11-05' })
      )
    );
    await waitFor(() => expect(screen.queryByPlaceholderText(PLACEHOLDER)).not.toBeInTheDocument());
  });

  it('offers no save when the model is unsure', async () => {
    reply({ ...lunch, confidence: 0.4 });
    render(<SmartInput />);
    open();
    submit('maybe lunch');

    await screen.findByText('Lunch for 15');
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('says so when the sentence cannot be processed', async () => {
    reply({ error: 'boom' }, false);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<SmartInput />);
    open();
    submit('???');

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't read that. Try again.");
  });

  it('explains a reminder in the past instead of a generic failure', async () => {
    reply({ action: 'create', type: 'reminder', confidence: 0.95, message: 'Run', data: { title: 'Run', date: '2020-01-01' } });
    (createReminderWithInvalidation as jest.Mock).mockRejectedValueOnce(new ApiError(400, 'REMINDER_PAST_DUE', 'past'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<SmartInput />);
    open();
    submit('remind me to run yesterday');

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('That time has already passed');
  });
});
