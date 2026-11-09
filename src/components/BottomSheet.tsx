'use client';

import React from 'react';
import { Modal } from './Modal';

/** `Modal` is already a bottom sheet on small screens; this name stays for the forms that read as sheets. */
export const BottomSheet: React.FC<React.ComponentProps<typeof Modal>> = (props) => <Modal {...props} />;
