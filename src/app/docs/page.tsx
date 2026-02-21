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
              <img
                src="https://raw.githubusercontent.com/RyanYuuki/AnymeX/main/assets/images/logo_transparent.png"
                alt="AnymeX"
                className="w-8 h-8"
              />
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
            Documentation
          </h1>
          <p className="text-neutral-400 max-w-2xl text-base md:text-lg leading-relaxed">
            Complete guide to creating, uploading, and applying themes for AnymeX.
          </p>
        </div>

        <div className="space-y-12">
          {/* Overview Section */}
          <section className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-white mb-4">What is a Theme?</h2>
            <p className="text-neutral-400 leading-relaxed">
              An AnymeX theme is a JSON configuration that defines the visual appearance of AnymeX.
              It includes colors, fonts, sizes, and other styling properties that determine how AnymeX
              looks and feels.
            </p>
          </section>

          {/* Quick Start Guide */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Quick Start Guide</h2>
            <p className="text-neutral-400 mb-6">
              Get started with AnymeX themes in 3 simple steps:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-base font-medium text-white mb-2">Register</h3>
                <p className="text-sm text-neutral-400">
                  Sign up as a creator in the Creator Hub
                </p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-base font-medium text-white mb-2">Upload</h3>
                <p className="text-sm text-neutral-400">
                  Upload your theme JSON through Creator Dashboard
                </p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-base font-medium text-white mb-2">Share</h3>
                <p className="text-sm text-neutral-400">
                  Your theme goes live immediately!
                </p>
              </div>
            </div>
          </section>

          {/* Becoming a Creator Section */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Becoming a Theme Creator</h2>
            <p className="text-neutral-400 mb-4">
              To share your themes with the community, you'll need to register as a theme creator first. Here's how:
            </p>
            <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
              <li>Go to the main page and click on <strong>Sign In</strong> in the navigation menu</li>
              <li>Click the <strong>Register</strong> tab to create your account</li>
              <li>Fill in your details:
                <ul className="list-disc list-inside ml-6 mt-2 text-neutral-400 space-y-1">
                  <li><strong>Username</strong> (required) - Your unique identifier</li>
                  <li><strong>Password</strong> (required) - At least 6 characters</li>
                  <li><strong>Profile URL</strong> (optional) - Your GitHub, social media, or any profile link. This link will be shown when users click on your name next to your themes</li>
                </ul>
              </li>
              <li>Submit and you'll be redirected to the Creator Dashboard</li>
            </ol>
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

          {/* Testing Your Theme Section */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Testing Your Theme</h2>
            <p className="text-neutral-400 mb-6">
              Before submitting your theme, test it thoroughly in AnymeX to ensure it looks great and functions correctly:
            </p>

            <div className="space-y-6">
              {/* Step 1: Validate JSON */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-black text-sm font-bold">1</span>
                  Validate Your JSON
                </h3>
                <p className="text-neutral-400 mb-3">
                  Make sure your JSON is valid before testing:
                </p>
                <ul className="space-y-2 text-sm text-neutral-400 list-disc list-inside ml-4">
                  <li>Use a JSON validator tool like <a href="https://jsonlint.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">jsonlint.com</a></li>
                  <li>Ensure all required properties are present (colors, typography, effects)</li>
                  <li>Check that color values are valid hex codes (e.g., #6366f1)</li>
                  <li>Verify no trailing commas or missing quotes</li>
                </ul>
              </div>

              {/* Step 2: Test in AnymeX */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-black text-sm font-bold">2</span>
                  Test in AnymeX
                </h3>
                <p className="text-neutral-400 mb-3">
                  Load your theme in AnymeX to see how it looks in action:
                </p>
                <ol className="space-y-2 text-sm text-neutral-400 list-decimal list-inside ml-4">
                  <li>Save your theme JSON file</li>
                  <li>Open AnymeX</li>
                  <li>Go to <strong>Settings</strong></li>
                  <li>Navigate to <strong>Player</strong> → <strong>Player Theme</strong></li>
                  <li>Import your JSON file</li>
                  <li>Apply the theme and inspect different screens</li>
                </ol>
              </div>

              {/* Step 3: Check Items */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-black text-sm font-bold">3</span>
                  Checklist for Quality
                </h3>
                <p className="text-neutral-400 mb-3">
                  Review your theme against these criteria:
                </p>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Text Readability</strong> - All text is clearly readable against backgrounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Color Contrast</strong> - Sufficient contrast between foreground and background colors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Consistent Spacing</strong> - Padding and margins are uniform throughout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">No Broken Colors</strong> - All color values are valid and render correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Proper Category</strong> - Theme is correctly categorized (Dark/Light/AMOLED)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Descriptive Name</strong> - Theme name clearly communicates its style</span>
                  </li>
                </ul>
              </div>

              {/* Step 4: Lighting Test */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-black text-sm font-bold">4</span>
                  Test in Different Lighting
                </h3>
                <p className="text-neutral-400 mb-3">
                  Check your theme in various environments:
                </p>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:sun-2-linear" className="text-yellow-500 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Bright Environment</strong> - View in daylight or bright room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:moon-linear" className="text-indigo-400 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Dark Environment</strong> - View in dim or dark room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="solar:monitor-linear" className="text-blue-400 shrink-0 mt-0.5" width={16} />
                    <span><strong className="text-neutral-300">Different Screens</strong> - Test on phone, tablet, and desktop if possible</span>
                  </li>
                </ul>
              </div>

              {/* Common Issues */}
              <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950/50">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Icon icon="solar:danger-triangle-linear" className="text-yellow-500" width={16} />
                  Common Issues to Avoid
                </h4>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>• Text that's too dark on dark backgrounds or too light on light backgrounds</li>
                  <li>• Borders that blend into backgrounds</li>
                  <li>• Colors that are too similar, making UI elements hard to distinguish</li>
                  <li>• Missing or invalid color properties causing fallback to default colors</li>
                  <li>• Font sizes that are too small or too large for comfortable reading</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Uploading Your Theme Section */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Uploading Your Theme</h2>
            <p className="text-neutral-400 mb-4">
              Once you've created your theme JSON and registered as a creator, you can upload it through the Creator Dashboard:
            </p>
            <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
              <li>Log in to your creator account at <strong>/auth</strong></li>
              <li>Go to the <strong>Creator Dashboard</strong></li>
              <li>Click the <strong>"Create New Theme"</strong> button</li>
              <li>Fill in the theme details:
                <ul className="list-disc list-inside ml-6 mt-2 text-neutral-400 space-y-1">
                  <li><strong>Theme Name</strong> - Display name for your theme</li>
                  <li><strong>Description</strong> - Brief description of your theme's style</li>
                  <li><strong>Category</strong> - Dark, Light, or AMOLED</li>
                </ul>
              </li>
              <li><strong>Upload your theme JSON file</strong> - Click or drag and drop your JSON file (it will auto-fill the name, description, and category if your JSON includes them)</li>
              <li>Click <strong>"Upload Theme"</strong> to submit</li>
              <li>🎉 Your theme is <strong>immediately visible</strong> to all users!</li>
            </ol>
          </section>

          {/* Applying Themes Section */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Applying Themes to AnymeX</h2>
            <p className="text-neutral-400 mb-4">
              Once your theme is visible on the main page, users can apply it to their AnymeX with a single click:
            </p>
            <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
              <li>Find your theme in the <strong>Themes Gallery</strong> on the main page</li>
              <li>Click the <strong>"Apply"</strong> button on the theme card</li>
              <li>AnymeX will open automatically and the theme will be added to your collection</li>
              <li>Switch to your new theme in AnymeX settings</li>
              <li>Enjoy your new theme! 🎨</li>
            </ol>
            <div className="mt-6 p-4 rounded-lg border border-neutral-800 bg-neutral-950/50">
              <p className="text-sm text-neutral-400 mb-2">
                <Icon icon="solar:info-circle-linear" className="inline mr-2" width={16} />
                <strong>How it works:</strong> The Apply button uses a deep link that tells the AnymeX app which theme to download and add to your collection:
              </p>
              <p className="text-sm text-neutral-500 mt-2 font-mono">
                anymex://theme?type=player&url=https://theme.json
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                If AnymeX doesn't open, make sure you have the AnymeX app installed on your device.
              </p>
            </div>
          </section>

          {/* Switching Themes Section */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Switching Between Themes in AnymeX</h2>
            <p className="text-neutral-400 mb-4">
              After clicking "Apply" and the theme is added to your collection, you can switch between themes anytime:
            </p>
            <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
              <li>Open <strong>AnymeX</strong></li>
              <li>Go to <strong>Settings</strong></li>
              <li>Navigate to <strong>Player</strong></li>
              <li>Select <strong>Player Theme</strong></li>
              <li>Choose any theme from your collection to apply it</li>
            </ol>
            <div className="mt-6 p-4 rounded-lg border border-neutral-800 bg-neutral-950/50">
              <p className="text-sm text-neutral-400">
                <Icon icon="solar:lightbulb-linear" className="inline mr-2" width={16} />
                <strong>Pro Tip:</strong> You can keep multiple themes in your collection and switch between them anytime without re-downloading!
              </p>
            </div>
          </section>

          {/* Profile URL for Creators */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Profile URL Feature</h2>
            <p className="text-neutral-400 mb-4">
              As a theme creator, you can add a profile URL that will be displayed when users click on your name in the theme listings:
            </p>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start gap-3">
                <Icon icon="solar:link-horizontal-linear" className="text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">During Registration</strong> - Add your profile URL when signing up as a creator
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon icon="solar:link-horizontal-linear" className="text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">Visibility</strong> - Your profile link appears next to your name under each theme you create
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon icon="solar:link-horizontal-linear" className="text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-300">Flexibility</strong> - You can link to GitHub, Twitter, personal website, or any other profile
                </span>
              </li>
            </ul>
            <div className="mt-6 p-4 rounded-lg border border-neutral-800 bg-neutral-950/50">
              <p className="text-sm text-neutral-400 mb-2">
                <Icon icon="solar:lightbulb-linear" className="inline mr-2" width={16} />
                <strong>Pro Tip:</strong> Use your GitHub profile URL so users can explore more of your work!
              </p>
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
