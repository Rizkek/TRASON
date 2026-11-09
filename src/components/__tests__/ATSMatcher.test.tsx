import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ATSMatcher } from '@/app/(app)/career/components/ATSMatcher';
import { extractTextFromFile } from '@/libs/fileExtractor';
import type { CareerApplication } from '@/types/database';

jest.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: () => ({ language: 'en', locale: 'en-US', timezone: 'UTC', currency: 'USD', module_features: {} }),
}));
jest.mock('@/libs/fileExtractor', () => ({ extractTextFromFile: jest.fn() }));

const application: CareerApplication = {
  id: 'a1',
  user_id: 'u',
  company_name: 'Acme',
  role_title: 'Frontend Dev',
  application_type: 'job',
  status: 'applied',
  applied_date: '2026-11-01',
  priority: 'medium',
  notes: 'react typescript',
  url: 'https://jobs.example.com/acme',
  location: 'Jakarta',
  created_at: '',
  updated_at: '',
};

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const analyze = () => fireEvent.click(screen.getByRole('button', { name: /Analyze match/ }));

describe('ATSMatcher', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cannot analyze until both texts are filled', () => {
    render(<ATSMatcher />);
    const button = screen.getByRole('button', { name: /Analyze match/ });

    expect(button).toBeDisabled();
    fill('Job description', 'react');
    expect(button).toBeDisabled();
    fill('Your resume / CV', 'react');
    expect(button).toBeEnabled();
  });

  it('shows the score and puts symbol terms under key skills', () => {
    render(<ATSMatcher />);
    fill('Job description', 'We use node.js and react');
    fill('Your resume / CV', 'react');
    analyze();

    // node.js counts 2, node and react 1 each; only react is in the resume: 1 of 4.
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Key skills')).toBeInTheDocument();
    expect(screen.getByText('node.js')).toBeInTheDocument();
  });

  it('reads a dropped file into the field', async () => {
    (extractTextFromFile as jest.Mock).mockResolvedValue('react docker');
    render(<ATSMatcher />);
    const field = screen.getByLabelText('Job description');

    fireEvent.drop(field, { dataTransfer: { files: [new File(['x'], 'jd.txt', { type: 'text/plain' })] } });

    await waitFor(() => expect(field).toHaveValue('react docker'));
    expect(extractTextFromFile).toHaveBeenCalledTimes(1);
  });

  it('shows an error when a file cannot be read', async () => {
    (extractTextFromFile as jest.Mock).mockRejectedValue(new Error('bad pdf'));
    render(<ATSMatcher />);

    fireEvent.drop(screen.getByLabelText('Your resume / CV'), { dataTransfer: { files: [new File(['x'], 'cv.pdf')] } });

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't read this document.");
  });

  it('fills the listing from the chosen application without its company, place or link', () => {
    render(<ATSMatcher applications={[application]} initialApplicationId="a1" />);

    const text = (screen.getByLabelText('Job description') as HTMLTextAreaElement).value;
    expect(text).toContain('Frontend Dev');
    expect(text).toContain('react typescript');
    expect(text).not.toContain('Acme');
    expect(text).not.toContain('Jakarta');
    expect(text).not.toContain('https://');
  });

  it('saves the score to the chosen application', async () => {
    const onSaveScore = jest.fn().mockResolvedValue(undefined);
    render(<ATSMatcher applications={[application]} initialApplicationId="a1" onSaveScore={onSaveScore} />);
    fill('Your resume / CV', 'react typescript frontend');
    analyze();

    // frontend, dev, react, typescript: three of four are in the resume.
    fireEvent.click(screen.getByRole('button', { name: 'Save score to this application' }));

    await waitFor(() => expect(onSaveScore).toHaveBeenCalledWith('a1', 75));
    expect(await screen.findByRole('button', { name: 'Saved' })).toBeDisabled();
  });

  it('says so when saving fails, and lets the user retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const onSaveScore = jest.fn().mockRejectedValueOnce(new Error('column missing')).mockResolvedValueOnce(undefined);
    render(<ATSMatcher applications={[application]} initialApplicationId="a1" onSaveScore={onSaveScore} />);
    fill('Your resume / CV', 'react');
    analyze();

    fireEvent.click(screen.getByRole('button', { name: 'Save score to this application' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't save the score.");

    fireEvent.click(screen.getByRole('button', { name: 'Save score to this application' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(onSaveScore).toHaveBeenCalledTimes(2);
  });

  it('offers no save button when no application is chosen', () => {
    render(<ATSMatcher applications={[application]} onSaveScore={jest.fn()} />);
    fill('Job description', 'react');
    fill('Your resume / CV', 'react');
    analyze();

    expect(screen.queryByRole('button', { name: 'Save score to this application' })).not.toBeInTheDocument();
  });

  it('asks to save again after a new analysis', async () => {
    const onSaveScore = jest.fn().mockResolvedValue(undefined);
    render(<ATSMatcher applications={[application]} initialApplicationId="a1" onSaveScore={onSaveScore} />);
    fill('Your resume / CV', 'react');
    analyze();
    fireEvent.click(screen.getByRole('button', { name: 'Save score to this application' }));
    await screen.findByRole('button', { name: 'Saved' });

    fill('Your resume / CV', 'react typescript frontend dev');
    analyze();

    expect(screen.getByRole('button', { name: 'Save score to this application' })).toBeEnabled();
  });
});
