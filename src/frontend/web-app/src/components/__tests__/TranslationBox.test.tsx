import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TranslationBox from '../TranslationBox';
import { backend_translate } from '../../hooks/backend.tsx';

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

const createProps = () => ({
  lastTranslation: { text: '', toEmoji: false, context: '', modelId: 'gpt-4o-mini' },
  setLastTranslation: vi.fn(),
  rating: null,
  setRating: vi.fn(),
  isTranslated: false,
  setTranslated: vi.fn(),
});

const backendTranslateMock = vi.mocked(backend_translate);

describe('TranslationBox', () => {
  beforeEach(() => {
    backendTranslateMock.mockReset();
  });

  it('disables translate button when no input is provided', () => {
    render(<TranslationBox {...createProps()} />);
    expect(screen.getByRole('button', { name: /translate/i })).toBeDisabled();
  });

  it('enables translate button after typing and displays backend result', async () => {
    const user = userEvent.setup();
    backendTranslateMock.mockResolvedValue('Hello but like as emojis');

    render(<TranslationBox {...createProps()} />);

    const input = screen.getByPlaceholderText(/enter emojis or text/i);
    await user.type(input, 'Hello');

    const translateButton = screen.getByRole('button', { name: /translate/i });
    expect(translateButton).toBeEnabled();

    await user.click(translateButton);

    await waitFor(() =>
      expect(backendTranslateMock).toHaveBeenCalledWith(
        false,
        'Hello',
        [],
        expect.any(AbortSignal),
        'gpt-4o-mini',
      ),
    );

    const output = screen.getByPlaceholderText(/translation will appear/i) as HTMLTextAreaElement;
    await waitFor(() => expect(output.value).toBe('Hello but like as emojis'));
  });
});

