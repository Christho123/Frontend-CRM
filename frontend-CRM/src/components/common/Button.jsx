/**
 * Botón reutilizable (puedes extender con variantes: primary, secondary, etc.)
 */
export function Button({ children, variant = 'primary', ...props }) {
  return (
    <button type="button" data-variant={variant} {...props}>
      {children}
    </button>
  );
}
