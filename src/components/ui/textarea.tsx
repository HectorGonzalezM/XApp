// src/components/ui/textarea.tsx

import * as React from 'react';
import { cn } from '@/lib/utils'; // Ensure this utility is used or remove if unnecessary

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
