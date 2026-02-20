import { Icon } from "@iconify/react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0 cursor-pointer pl-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black">
                <Icon icon="solar:play-stream-bold" width={18} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">
                AnymeX
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Themes
              </Link>
              <div className="h-4 w-px bg-neutral-800 hidden sm:block mx-2"></div>
              <a
                href="https://github.com/RyanYuuki/AnymeX"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors inline-flex items-center justify-center"
              >
                Get App
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative py-24 md:py-32 flex flex-col items-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white max-w-4xl mb-6">
            Theme Creation Guide
          </h1>
          <p className="text-neutral-400 max-w-2xl text-base md:text-lg leading-relaxed">
            Learn how to create custom themes for AnymeX player and share them with the community.
          </p>
        </div>

        <div className="space-y-12">
          {/* Overview Section */}
          <section className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-white mb-4">What is a Theme?</h2>
            <p className="text-neutral-400 leading-relaxed">
              An AnymeX theme is a JSON configuration that defines the visual appearance of the player.
              It includes colors, fonts, sizes, and other styling properties that determine how the player
              interface looks and feels.
            </p>
          </section>

          {/* Theme Structure */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Theme Structure</h2>
            <p className="text-neutral-400 mb-4">
              A theme JSON must follow this structure with the following properties:
            </p>

            <div className="bg-neutral-950 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-neutral-300 font-mono">
{`{
  "name": "Theme Name",
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "background": "#171717",
    "foreground": "#fafafa",
    "card": "#262626",
    "cardForeground": "#fafafa",
    "border": "#404040",
    "accent": "#525252"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": {
      "small": "0.875rem",
      "medium": "1rem",
      "large": "1.25rem"
    }
  },
  "spacing": {
    "small": "0.5rem",
    "medium": "1rem",
    "large": "2rem"
  },
  "effects": {
    "blur": "8px",
    "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "borderRadius": "0.5rem"
  }
}`}
              </pre>
            </div>
          </section>

          {/* Properties Guide */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Properties Guide</h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
                <h3 className="text-lg font-medium text-white mb-2">colors</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  Defines the color palette used throughout the theme.
                </p>
                <ul className="space-y-1 text-sm text-neutral-500">
                  <li><code className="text-neutral-300">primary</code> - Main accent color</li>
                  <li><code className="text-neutral-300">secondary</code> - Secondary accent color</li>
                  <li><code className="text-neutral-300">background</code> - Page background</li>
                  <li><code className="text-neutral-300">foreground</code> - Main text color</li>
                  <li><code className="text-neutral-300">card</code> - Card background</li>
                  <li><code className="text-neutral-300">border</code> - Border color</li>
                  <li><code className="text-neutral-300">accent</code> - Interactive element accent</li>
                </ul>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
                <h3 className="text-lg font-medium text-white mb-2">typography</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  Controls font families and sizes.
                </p>
                <ul className="space-y-1 text-sm text-neutral-500">
                  <li><code className="text-neutral-300">fontFamily</code> - CSS font family stack</li>
                  <li><code className="text-neutral-300">fontSize</code> - Size presets (small, medium, large)</li>
                </ul>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
                <h3 className="text-lg font-medium text-white mb-2">effects</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  Visual effects applied to elements.
                </p>
                <ul className="space-y-1 text-sm text-neutral-500">
                  <li><code className="text-neutral-300">blur</code> - Backdrop blur amount</li>
                  <li><code className="text-neutral-300">shadow</code> - Box shadow value</li>
                  <li><code className="text-neutral-300">borderRadius</code> - Corner radius</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Example Themes */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Example Themes</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
                <h3 className="text-lg font-medium text-white mb-3">Dark Theme</h3>
                <div className="bg-neutral-950 rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">
                  <pre className="text-xs text-neutral-300 font-mono">
{`{
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "background": "#171717",
    "foreground": "#fafafa",
    "card": "#262626",
    "cardForeground": "#fafafa",
    "border": "#404040",
    "accent": "#525252"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": {
      "small": "0.875rem",
      "medium": "1rem",
      "large": "1.25rem"
    }
  },
  "spacing": {
    "small": "0.5rem",
    "medium": "1rem",
    "large": "2rem"
  },
  "effects": {
    "blur": "8px",
    "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
    "borderRadius": "0.5rem"
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
                <h3 className="text-lg font-medium text-white mb-3">Neon Theme</h3>
                <div className="bg-neutral-950 rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">
                  <pre className="text-xs text-neutral-300 font-mono">
{`{
  "colors": {
    "primary": "#00ff88",
    "secondary": "#ff00ff",
    "background": "#0a0a0f",
    "foreground": "#ffffff",
    "card": "#121218",
    "cardForeground": "#ffffff",
    "border": "#2a2a35",
    "accent": "#1a1a25"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": {
      "small": "0.875rem",
      "medium": "1rem",
      "large": "1.25rem"
    }
  },
  "spacing": {
    "small": "0.5rem",
    "medium": "1rem",
    "large": "2rem"
  },
  "effects": {
    "blur": "12px",
    "shadow": "0 0 20px rgba(0, 255, 136, 0.3)",
    "borderRadius": "0.75rem"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Best Practices</h2>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-start gap-3">
                <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">Use proper color contrast</strong> - Ensure text is readable against backgrounds
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">Test in different lighting</strong> - Verify appearance in dark and bright environments
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">Provide clear descriptions</strong> - Help users understand your theme's style
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">Choose appropriate category</strong> - Dark, Light, or AMOLED
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">Validate JSON before uploading</strong> - Ensure your theme is properly formatted
                </span>
              </li>
            </ul>
          </section>

          {/* Upload Section */}
          <section className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Upload Your Theme</h2>
            <p className="text-neutral-400 mb-4">
              Ready to share your theme with the community? Follow these steps:
            </p>
            <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
              <li>Create your theme JSON following the structure above</li>
              <li>Test it thoroughly in your AnymeX player</li>
              <li>Click the "Upload" button on the themes page</li>
              <li>Fill in the theme details and paste your JSON</li>
              <li>Submit and share with the community!</li>
            </ol>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                <Icon icon="solar:upload-minimalistic-linear" width={16} />
                Upload Theme
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-neutral-900 bg-neutral-950 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-600">© 2024 AnymeX Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
              Back to Themes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
