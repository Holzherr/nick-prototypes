/**
 * The strawberry. This is the only colour anywhere in the product — a red berry with a black
 * calyx — so the fill is baked in rather than inherited, and nothing else in the app should
 * introduce a hue. Flat, no gradients, legible down to 16px.
 */
export const StrawberryMark = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
    <path
      d="M12 21.6c-4-2.3-6.5-5.6-6.5-8.9 0-3 2.8-5.2 6.5-5.2s6.5 2.2 6.5 5.2c0 3.3-2.5 6.6-6.5 8.9Z"
      fill="#e11d48"
    />
    <path
      d="M12 2.4c.75 1 1.2 2 1.3 3.05 1.05-.75 2.15-1.05 3.3-1.05-.2 1.25-.85 2.25-1.85 3 1.05.2 2 .65 2.8 1.4-1.2.65-2.4.85-3.55.6.35.55.6 1.15.7 1.8-.95-.3-1.8-.85-2.45-1.6-.65.75-1.5 1.3-2.45 1.6.1-.65.35-1.25.7-1.8-1.15.25-2.35.05-3.55-.6.8-.75 1.75-1.2 2.8-1.4-1-.75-1.65-1.75-1.85-3 1.15 0 2.25.3 3.3 1.05.1-1.05.55-2.05 1.3-3.05Z"
      fill="#0f0f0f"
    />
    <circle cx="9.9" cy="13.4" r=".62" fill="#fff" />
    <circle cx="14.1" cy="13.4" r=".62" fill="#fff" />
    <circle cx="12" cy="16.4" r=".62" fill="#fff" />
  </svg>
);
