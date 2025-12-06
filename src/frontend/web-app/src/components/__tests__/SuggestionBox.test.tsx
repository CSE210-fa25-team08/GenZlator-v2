import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SuggestionBox from '../SuggestionBox';
import { backend_feedback } from '../../hooks/backend.tsx';

vi.mock('../../hooks/backend.tsx', () => ({
  backend_translate: vi.fn(),
  backend_feedback: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('emoji-picker-react', () => ({
  __esModule: true,
  default: () => <div data-testid="emoji-picker-mock" />,
}));

const backendFeedbackMock = vi.mocked(backend_feedback);

describe('SuggestionBox', () => {
  beforeEach(() => {
    backendFeedbackMock.mockReset();
  });

  it('disables submit button until a suggestion is entered', async () => {
    const user = userEvent.setup();
    backendFeedbackMock.mockResolvedValue(undefined);

    render(<SuggestionBox lastTranslation={{ text: 'hello', toEmoji: false }} rating={false} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/enter your suggested translation/i);
    await user.type(textarea, 'Better translation');
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() =>
      expect(backendFeedbackMock).toHaveBeenCalledWith('hello', false, 'Better translation'),
    );

    await waitFor(() => expect(textarea).toHaveValue(''));
  });
});

