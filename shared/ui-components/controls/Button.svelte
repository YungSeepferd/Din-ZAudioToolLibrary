<script>
  let { label = 'Button', variant = 'primary', disabled = false, onclick = () => {} } = $props();
</script>

<button
  class:primary={variant === 'primary'}
  class:secondary={variant === 'secondary'}
  class:danger={variant === 'danger'}
  {disabled}
  onmousedown={onclick}
>
  {label}
</button>

<style>
  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    user-select: none;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .primary {
    background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  .primary:not(:disabled):active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .secondary {
    background: linear-gradient(to bottom, #6b7280, #4b5563);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .secondary:not(:disabled):active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .danger {
    background: linear-gradient(to bottom, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  .danger:not(:disabled):active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
</style>
