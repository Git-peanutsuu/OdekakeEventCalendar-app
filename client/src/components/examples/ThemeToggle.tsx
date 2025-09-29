import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <span>Toggle theme:</span>
        <ThemeToggle />
      </div>
      <p className="text-sm text-muted-foreground">
        Click the button to switch between light and dark themes
      </p>
    </div>
  );
}