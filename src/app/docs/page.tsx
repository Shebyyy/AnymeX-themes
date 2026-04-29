"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  role: string;
}

const navSections = [
  { id: "introduction", label: "Introduction" },
  { id: "quick-start", label: "Quick Start" },
  { id: "theme-json-structure", label: "Theme JSON Structure" },
  { id: "theme-collection-formats", label: "Collection Formats" },
  { id: "color-formats", label: "Color Formats" },
  { id: "global-styles", label: "Global Styles", children: [
    { id: "panel-style", label: "Panel Style" },
    { id: "button-style", label: "Button Style" },
    { id: "primary-button-style", label: "Primary Button" },
    { id: "chip-badge-style", label: "Chip / Badge" },
    { id: "text-style", label: "Text Style" },
  ]},
  { id: "layout-zones", label: "Layout Zones", children: [
    { id: "top-zone", label: "Top Zone" },
    { id: "middle-center-zone", label: "Middle / Center" },
    { id: "bottom-zone", label: "Bottom Zone" },
  ]},
  { id: "zone-animation-behavior", label: "Animation & Behavior" },
  { id: "theme-items-reference", label: "Theme Items", children: [
    { id: "buttons", label: "Buttons" },
    { id: "display-elements", label: "Display Elements" },
    { id: "layout-helpers", label: "Layout Helpers" },
    { id: "rich-text-elements", label: "Rich Text" },
  ]},
  { id: "conditional-visibility", label: "Conditional Visibility" },
  { id: "progress-bar-customization", label: "Progress Bar" },
  { id: "custom-icons", label: "Custom Icons" },
  { id: "per-item-style-overrides", label: "Style Overrides" },
  { id: "insets-spacing", label: "Insets & Spacing" },
  { id: "animation-curves", label: "Animation Curves" },
  { id: "locked-player-state", label: "Locked Player State" },
  { id: "complete-example", label: "Complete Example" },
  { id: "tips-best-practices", label: "Tips & Best Practices" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

const siteSections = [
  { id: "becoming-creator", label: "Becoming a Creator" },
  { id: "uploading-theme", label: "Uploading Your Theme" },
  { id: "applying-themes", label: "Applying Themes" },
  { id: "switching-themes", label: "Switching Themes" },
  { id: "profile-url", label: "Profile URL Feature" },
];

export default function DocsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { toast } = useToast();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("creator_user") || localStorage.getItem("admin_user");

    if ((creatorToken || adminToken) && userStr) {
      try {
        const token = creatorToken || adminToken;
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUser(data.user);
          setUserRole(data.user.role);
        } else {
          localStorage.removeItem("creator_token");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("creator_user");
          localStorage.removeItem("admin_user");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    }
  };

  const handleLogout = async () => {
    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const token = creatorToken || adminToken;

    try {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("creator_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("creator_user");
      localStorage.removeItem("admin_user");
      setIsLoggedIn(false);
      setUser(null);
      setUserRole(null);
      toast({
        title: "Logged out successfully",
      });
    }
  };

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      {/* Ambient Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="glow-orb glow-orb-violet w-[500px] h-[350px] top-[-5%] left-[15%] animate-float-slow" />
        <div className="glow-orb glow-orb-cyan w-[400px] h-[300px] top-[5%] right-[10%] animate-float-slow" style={{ animationDelay: "3s" }} />
      </div>

      {/* Navigation */}
      <nav className="glass-nav fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl rounded-2xl transition-all">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 cursor-pointer pl-2">
              <img
                src="https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png"
                alt="AnymeX"
                className="w-8 h-8"
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">AnymeX</span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                <a
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Themes
                </a>

                {isLoggedIn && user ? (
                  <>
                    {/* Profile Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-border bg-card">
                            {user?.profileUrl ? (
                              <img
                                src={getAvatarUrl(user.username, user.profileUrl)}
                                alt={user.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const icon = target.parentElement?.querySelector('div');
                                  if (icon) icon.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full hidden items-center justify-center">
                              <Icon icon="solar:user-bold" width={14} className="text-muted-foreground" />
                            </div>
                          </div>
                          {user?.username || "Profile"}
                          <Icon icon="solar:alt-arrow-down-linear" width={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="glass-surface min-w-[180px] border-border/50"
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href="/profile"
                            className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                          >
                            <Icon icon="solar:user-linear" width={14} />
                            My Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard"
                            className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                          >
                            <Icon icon="solar:palette-bold" width={14} />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin/users"
                                className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                              >
                                <Icon icon="solar:users-group-rounded-bold" width={14} />
                                Manage Users
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin/themes"
                                className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                              >
                                <Icon icon="solar:gallery-wide-bold" width={14} />
                                Theme Approvals
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer text-destructive hover:text-destructive flex items-center gap-2"
                        >
                          <Icon icon="solar:logout-2-linear" width={14} />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    {/* Logged out: Show unified Auth */}
                    <Link
                      href="/auth"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <Icon icon="solar:palette-bold" width={16} />
                      Sign In
                    </Link>
                  </>
                )}
                <div className="h-4 w-px bg-neutral-800 mx-2"></div>
                <a
                  href="https://github.com/RyanYuuki/AnymeX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-violet rounded-full px-5 py-2 text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
                >
                  Get App
                </a>
              </div>

              {/* Mobile Menu */}
              <div className="flex md:hidden">
                <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      <Icon icon="solar:hamburger-menu-linear" width={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="glass-surface min-w-[200px] border-border/50"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href="/"
                        className="cursor-pointer text-foreground/80 hover:text-foreground"
                      >
                        Themes
                      </Link>
                    </DropdownMenuItem>

                    {isLoggedIn && user ? (
                      <>
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2">
                            <Icon icon="solar:user-linear" width={14} />
                            My Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2">
                            <Icon icon="solar:palette-bold" width={14} />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/admin/users" className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2">
                                <Icon icon="solar:users-group-rounded-bold" width={14} />
                                Manage Users
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/admin/themes" className="cursor-pointer text-neutral-300 hover:text-white flex items-center gap-2">
                                <Icon icon="solar:gallery-wide-bold" width={14} />
                                Theme Approvals
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer text-red-400 hover:text-red-300 flex items-center gap-2"
                        >
                          <Icon icon="solar:logout-2-linear" width={14} />
                          Logout
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/auth"
                            className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2"
                          >
                            <Icon icon="solar:palette-bold" width={14} />
                            Sign In / Register
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem asChild>
                      <a
                        href="https://github.com/RyanYuuki/AnymeX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-foreground font-medium"
                      >
                        Get App
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="glass-surface rounded-lg p-2.5 border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle docs navigation"
        >
          <Icon icon={sidebarOpen ? "solar:close-circle-linear" : "solar:document-text-linear"} width={20} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-24 left-0 z-30 w-72 h-[calc(100vh-7rem)] glass-surface border-r border-border/30 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:top-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Theme Reference</h2>
          <nav className="space-y-0.5">
            {navSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/30"
                  }`}
                >
                  {section.label}
                </button>
                {section.children?.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => scrollToSection(child.id)}
                    className={`w-full text-left pl-7 pr-3 py-1 text-xs rounded-md transition-colors ${
                      activeSection === child.id
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-muted-foreground/70 hover:text-foreground hover:bg-card/30"
                    }`}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-6">Site Guide</h2>
          <nav className="space-y-0.5">
            {siteSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                  activeSection === section.id
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/30"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} className="relative z-10 lg:pl-72 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero */}
          <div className="relative py-24 md:py-32 flex flex-col items-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text max-w-4xl mb-6">
              Theme Documentation
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed">
              Complete guide to creating JSON-based player control themes for AnymeX.
            </p>
          </div>

          <div className="space-y-12 pb-16">

            {/* ==================== 1. INTRODUCTION ==================== */}
            <section id="introduction">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:info-circle-linear" width={22} className="text-primary" />
                Introduction
              </h2>
              <div className="glass-surface rounded-xl p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  AnymeX supports <strong className="text-foreground">JSON-based player control themes</strong> that allow you to fully customize the video player UI. Themes control:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: "solar:widget-2-linear", label: "Layout", desc: "Which buttons appear where (top, center, bottom)" },
                    { icon: "solar:pallete-2-linear", label: "Appearance", desc: "Colors, blur, borders, shadows, border radius" },
                    { icon: "solar:play-circle-linear", label: "Animations", desc: "Slide/fade/scale transitions for controls" },
                    { icon: "solar:shield-check-linear", label: "Behavior", desc: "Conditional visibility based on player state" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border/40 bg-card/30 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon={item.icon} width={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Themes are imported as JSON and applied in <strong className="text-foreground">Settings &gt; Player &gt; Player Control Theme</strong>.
                </p>
              </div>
            </section>

            {/* ==================== 2. QUICK START ==================== */}
            <section id="quick-start">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:bolt-circle-linear" width={22} className="text-primary" />
                Quick Start
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Here is the absolute minimum theme — just an <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">id</code>:
                </p>
                <CodeBlock>{`{
  "id": "my_minimal_theme"
}`}</CodeBlock>
                <p className="text-sm text-muted-foreground">
                  That&apos;s it! AnymeX will generate the default layout with default styling. To customize, add only what you want to change. Everything has sensible defaults.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Adding a Name</h3>
                <CodeBlock>{`{
  "id": "my_theme",
  "name": "My Cool Theme"
}`}</CodeBlock>

                <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Customizing Colors with a Palette</h3>
                <CodeBlock>{`{
  "id": "neon_theme",
  "name": "Neon Glow",
  "palette": {
    "accent": "#00E5FF",
    "bg": "rgba(0, 0, 0, 0.5)",
    "border": "rgba(0, 229, 255, 0.3)"
  },
  "styles": {
    "button": {
      "color": "@bg",
      "borderColor": "@border",
      "iconColor": "@accent"
    },
    "panel": {
      "color": "@bg",
      "borderColor": "@border"
    }
  }
}`}</CodeBlock>
              </div>
            </section>

            {/* ==================== 3. THEME JSON STRUCTURE ==================== */}
            <section id="theme-json-structure">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:code-square-linear" width={22} className="text-primary" />
                Theme JSON Structure
              </h2>
              <p className="text-muted-foreground mb-4">
                A theme object has these <strong className="text-foreground">top-level properties</strong>:
              </p>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card/40 border-b border-border/40">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Property</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Required</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prop: "id", type: "string", req: <span className="text-yellow-500 font-semibold">Yes</span>, desc: "Unique identifier for the theme" },
                      { prop: "name", type: "string", req: "No", desc: "Display name shown in theme picker (defaults to id)" },
                      { prop: "palette", type: "object", req: "No", desc: 'Named color variables (referenced as @key)' },
                      { prop: "styles", type: "object", req: "No", desc: "Global style definitions" },
                      { prop: "top", type: "object", req: "No", desc: "Top control bar (back, title, settings)" },
                      { prop: "middle / center", type: "object", req: "No", desc: "Center controls (play/pause, seek)" },
                      { prop: "bottom", type: "object", req: "No", desc: "Bottom controls + progress bar" },
                    ].map((row, i) => (
                      <tr key={row.prop} className={i % 2 === 0 ? "bg-card/20" : ""}>
                        <td className="px-4 py-2.5"><code className="text-primary text-xs">{row.prop}</code></td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.type}</td>
                        <td className="px-4 py-2.5">{row.req}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 rounded-lg border border-border/30 bg-card/20">
                <p className="text-xs text-muted-foreground">
                  <Icon icon="solar:info-circle-linear" width={14} className="inline mr-1" />
                  The center zone accepts both <code className="text-primary">"middle"</code> and <code className="text-primary">"center"</code> as keys — they are interchangeable.
                </p>
              </div>
            </section>

            {/* ==================== 4. THEME COLLECTION FORMATS ==================== */}
            <section id="theme-collection-formats">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:layers-minimalistic-linear" width={22} className="text-primary" />
                Theme Collection Formats
              </h2>
              <p className="text-muted-foreground mb-4">AnymeX supports importing themes in several formats:</p>
              <div className="space-y-4">
                {[
                  { title: "Array of Themes", code: `{\n  "themes": [\n    { "id": "theme_1", "name": "Theme One" },\n    { "id": "theme_2", "name": "Theme Two" }\n  ]\n}` },
                  { title: "Single Wrapped Theme", code: `{\n  "theme": { "id": "my_theme", "name": "My Theme" }\n}` },
                  { title: "Bare Theme Object", code: `{ "id": "my_theme", "name": "My Theme" }` },
                  { title: "Bare Array", code: `[\n  { "id": "theme_1" },\n  { "id": "theme_2" }\n]` },
                ].map((fmt) => (
                  <div key={fmt.title}>
                    <h3 className="text-sm font-medium text-foreground mb-2">{fmt.title}</h3>
                    <CodeBlock>{fmt.code}</CodeBlock>
                  </div>
                ))}
              </div>
            </section>

            {/* ==================== 5. COLOR FORMATS ==================== */}
            <section id="color-formats">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:pallete-2-linear" width={22} className="text-primary" />
                Color Formats
              </h2>
              <p className="text-muted-foreground mb-4">All color properties support these formats:</p>
              <div className="overflow-x-auto rounded-lg border border-border/40 mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card/40 border-b border-border/40">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Format</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Example</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { fmt: "Hex", ex: '"#FF5722" or "#AARRGGBB"', desc: "Standard hex color" },
                      { fmt: "RGBA function", ex: '"rgba(255, 255, 255, 0.8)"', desc: "Red, Green, Blue, Alpha (0-1)" },
                      { fmt: "hex() function", ex: '"hex(#FF5722)"', desc: "Wrapped hex color" },
                      { fmt: "dynamic() function", ex: '"dynamic(primary)"', desc: "Uses app's Material 3 theme color" },
                      { fmt: "dynamic() + alpha", ex: '"dynamic(surface, 0.5)"', desc: "Theme color with custom opacity" },
                      { fmt: "Palette reference", ex: '"@myColor"', desc: 'References a key from the palette object' },
                    ].map((row, i) => (
                      <tr key={row.fmt} className={i % 2 === 0 ? "bg-card/20" : ""}>
                        <td className="px-4 py-2.5 font-medium text-foreground">{row.fmt}</td>
                        <td className="px-4 py-2.5"><code className="text-xs text-primary">{row.ex}</code></td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-foreground mb-3">Dynamic Color Keys</h3>
              <p className="text-sm text-muted-foreground mb-3">The <code className="text-primary">dynamic()</code> function accepts these Material 3 color keys:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-6">
                {["primary", "onPrimary", "primaryContainer", "secondary", "onSecondary", "secondaryContainer", "tertiary", "onTertiary", "tertiaryContainer", "error", "onError", "errorContainer", "surface", "onSurface", "surfaceVariant", "onSurfaceVariant", "background", "onBackground", "outline", "outlineVariant", "inverseSurface", "inversePrimary", "scrim", "shadow"].map((key) => (
                  <code key={key} className="text-xs bg-card/30 border border-border/30 rounded px-2 py-1 text-muted-foreground">{key}</code>
                ))}
              </div>

              <h3 className="text-lg font-medium text-foreground mb-3">Palette Example</h3>
              <CodeBlock>{`{
  "palette": {
    "bg": "rgba(0, 0, 0, 0.6)",
    "accent": "#FF6B35",
    "text": "rgba(255, 255, 255, 0.9)",
    "muted": "rgba(255, 255, 255, 0.4)",
    "border": "rgba(255, 107, 53, 0.3)"
  },
  "styles": {
    "button": {
      "iconColor": "@accent",
      "color": "@bg",
      "borderColor": "@border"
    },
    "chip": {
      "textColor": "@text",
      "color": "@bg",
      "borderColor": "@muted"
    }
  }
}`}</CodeBlock>
              <div className="mt-3 p-3 rounded-lg border border-border/30 bg-card/20">
                <p className="text-xs text-muted-foreground">
                  <Icon icon="solar:info-circle-linear" width={14} className="inline mr-1" />
                  You can use <code className="text-primary">"note_by_dev"</code> as a palette key to add comments — it will be ignored by the parser.
                </p>
              </div>
            </section>

            {/* ==================== 6. GLOBAL STYLES ==================== */}
            <section id="global-styles">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:paint-roller-linear" width={22} className="text-primary" />
                Global Styles
              </h2>
              <p className="text-muted-foreground mb-6">
                The <code className="text-primary">styles</code> object defines the default appearance for all elements. Individual items can override these.
              </p>

              {/* Panel Style */}
              <section id="panel-style" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Panel Style</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The background panel behind groups of controls. Applied to the container wrapping each zone.
                </p>
                <CodeBlock>{`{
  "styles": {
    "panel": {
      "enabled": true,
      "showBackground": true,
      "showBorder": true,
      "radius": 22,
      "blur": 18,
      "color": null,
      "borderColor": null,
      "borderWidth": 0.8,
      "padding": { "horizontal": 12, "vertical": 10 },
      "shadowColor": null,
      "shadowBlur": 18,
      "shadowOffsetY": 8
    }
  }
}`}</CodeBlock>
                <PropsTable rows={[
                  { prop: "enabled", type: "bool", def: "true", desc: "Show the panel behind controls" },
                  { prop: "showBackground", type: "bool", def: "true", desc: "Fill the panel background" },
                  { prop: "showBorder", type: "bool", def: "true", desc: "Show the panel border" },
                  { prop: "radius", type: "double", def: "22", desc: "Border radius in pixels" },
                  { prop: "blur", type: "double", def: "18", desc: "Backdrop blur sigma (0 = no blur)" },
                  { prop: "color", type: "string?", def: "null", desc: "Background color (default: white at 8%)" },
                  { prop: "borderColor", type: "string?", def: "null", desc: "Border color (default: white at 22%)" },
                  { prop: "borderWidth", type: "double", def: "0.8", desc: "Border width in pixels" },
                  { prop: "padding", type: "insets", def: "{h:12, v:10}", desc: "Inner padding" },
                  { prop: "shadowColor", type: "string?", def: "null", desc: "Shadow color (default: black at 22%)" },
                  { prop: "shadowBlur", type: "double", def: "18", desc: "Shadow blur radius" },
                  { prop: "shadowOffsetY", type: "double", def: "8", desc: "Shadow vertical offset" },
                ]} />
              </section>

              {/* Button Style */}
              <section id="button-style" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Button Style</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Controls the appearance of regular buttons (not play/pause).
                </p>
                <CodeBlock>{`{
  "styles": {
    "button": {
      "size": 40,
      "iconSize": 20,
      "radius": 16,
      "blur": 14,
      "color": null,
      "borderColor": null,
      "borderWidth": 0.8,
      "iconColor": null,
      "disabledIconColor": null
    }
  }
}`}</CodeBlock>
                <PropsTable rows={[
                  { prop: "size", type: "double", def: "40", desc: "Button total size in pixels (width & height)" },
                  { prop: "iconSize", type: "double", def: "20", desc: "Icon size in pixels" },
                  { prop: "radius", type: "double", def: "16", desc: "Button border radius" },
                  { prop: "blur", type: "double", def: "14", desc: "Backdrop blur sigma" },
                  { prop: "color", type: "string?", def: "null", desc: "Button background (default: white at 12%)" },
                  { prop: "borderColor", type: "string?", def: "null", desc: "Border color (default: white at 28%)" },
                  { prop: "borderWidth", type: "double", def: "0.8", desc: "Border width" },
                  { prop: "iconColor", type: "string?", def: "null", desc: "Icon color (default: white)" },
                  { prop: "disabledIconColor", type: "string?", def: "null", desc: "Icon color when disabled (default: white at 55%)" },
                ]} />
              </section>

              {/* Primary Button Style */}
              <section id="primary-button-style" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Primary Button Style</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Same structure as Button Style, but used for the <strong className="text-foreground">play/pause button</strong> by default.
                </p>
                <CodeBlock>{`{
  "styles": {
    "primaryButton": {
      "size": 48,
      "iconSize": 26,
      "radius": 20
    }
  }
}`}</CodeBlock>
              </section>

              {/* Chip/Badge Style */}
              <section id="chip-badge-style" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Chip / Badge Style</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Controls badges and time labels (episode badge, quality badge, time displays).
                </p>
                <CodeBlock>{`{
  "styles": {
    "chip": {
      "radius": 14,
      "color": null,
      "backgroundColor": null,
      "borderColor": null,
      "borderWidth": 0.6,
      "textColor": null,
      "fontSize": 12,
      "fontWeight": "w600",
      "letterSpacing": 0.2,
      "padding": { "horizontal": 10, "vertical": 6 }
    }
  }
}`}</CodeBlock>
                <PropsTable rows={[
                  { prop: "radius", type: "double", def: "14", desc: "Border radius" },
                  { prop: "color", type: "string?", def: "null", desc: "Main color (fallback if backgroundColor not set)" },
                  { prop: "backgroundColor", type: "string?", def: "null", desc: "Background color (falls back to color)" },
                  { prop: "borderColor", type: "string?", def: "null", desc: "Border color" },
                  { prop: "borderWidth", type: "double", def: "0.6", desc: "Border width" },
                  { prop: "textColor", type: "string?", def: "null", desc: "Text color (default: white)" },
                  { prop: "fontSize", type: "double", def: "12", desc: "Font size in pixels" },
                  { prop: "fontWeight", type: "string/int", def: '"w600"', desc: "Font weight" },
                  { prop: "letterSpacing", type: "double", def: "0.2", desc: "Letter spacing" },
                  { prop: "padding", type: "insets", def: "{h:10, v:6}", desc: "Inner padding" },
                ]} />
              </section>

              {/* Text Style */}
              <section id="text-style" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Text Style</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Controls the appearance of text elements (title, labels).
                </p>
                <CodeBlock>{`{
  "styles": {
    "text": {
      "textColor": null,
      "backgroundColor": null,
      "fontSize": 14,
      "fontWeight": "w700",
      "letterSpacing": 0.2,
      "height": 1.2
    }
  }
}`}</CodeBlock>
                <PropsTable rows={[
                  { prop: "textColor", type: "string?", def: "null", desc: "Text color (default: white)" },
                  { prop: "backgroundColor", type: "string?", def: "null", desc: "Optional background behind text" },
                  { prop: "fontSize", type: "double", def: "14", desc: "Font size" },
                  { prop: "fontWeight", type: "string/int", def: '"w700"', desc: "Font weight" },
                  { prop: "letterSpacing", type: "double", def: "0.2", desc: "Letter spacing" },
                  { prop: "height", type: "double", def: "1.2", desc: "Line height multiplier" },
                ]} />
              </section>
            </section>

            {/* ==================== 7. LAYOUT ZONES ==================== */}
            <section id="layout-zones">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:widget-5-linear" width={22} className="text-primary" />
                Layout Zones
              </h2>
              <p className="text-muted-foreground mb-6">
                The player is divided into <strong className="text-foreground">three zones</strong>: top, middle, and bottom. Each zone has its own layout, locked state layout, and behavior settings.
              </p>

              {/* Top Zone */}
              <section id="top-zone" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Top Zone</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contains the back button, media title, badges, and action buttons.
                </p>
                <CodeBlock>{`{
  "top": {
    "normal": {
      "left": ["back"],
      "center": ["title", "episode_badge", "series_badge", "quality_badge"],
      "right": ["lock_controls", "toggle_fullscreen", "open_settings"]
    },
    "locked": {
      "right": ["unlock_controls"]
    }
  }
}`}</CodeBlock>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Structure:</strong> <code className="text-primary">normal</code> — 3 columns (left, center, right); <code className="text-primary">locked</code> — optional locked layout</p>
                  <p className="text-xs text-muted-foreground">
                    <Icon icon="solar:info-circle-linear" width={14} className="inline mr-1" />
                    The center column displays the title and badges in a vertically-stacked column layout.
                  </p>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border/40 mt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-card/40 border-b border-border/40">
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Column</th>
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Normal Items</th>
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Locked Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-card/20"><td className="px-4 py-2"><code className="text-primary">left</code></td><td className="px-4 py-2 text-muted-foreground">back</td><td className="px-4 py-2 text-muted-foreground">—</td></tr>
                      <tr><td className="px-4 py-2"><code className="text-primary">center</code></td><td className="px-4 py-2 text-muted-foreground">title, episode_badge, series_badge, quality_badge</td><td className="px-4 py-2 text-muted-foreground">—</td></tr>
                      <tr className="bg-card/20"><td className="px-4 py-2"><code className="text-primary">right</code></td><td className="px-4 py-2 text-muted-foreground">lock_controls, toggle_fullscreen, open_settings</td><td className="px-4 py-2 text-muted-foreground">unlock_controls</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Middle/Center Zone */}
              <section id="middle-center-zone" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Middle / Center Zone</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contains main playback controls (play/pause, seek, skip episodes).
                </p>
                <CodeBlock>{`{
  "middle": {
    "normal": {
      "items": ["previous_episode", "seek_back", "play_pause", "seek_forward", "next_episode"]
    },
    "locked": {
      "items": []
    }
  }
}`}</CodeBlock>
                <p className="text-sm text-muted-foreground mt-3">
                  <strong className="text-foreground">Structure:</strong> <code className="text-primary">normal.items</code> — Flat list in a horizontal row. <code className="text-primary">locked.items</code> — Items shown when locked (empty by default).
                </p>
              </section>

              {/* Bottom Zone */}
              <section id="bottom-zone" className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-3">Bottom Zone</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The most complex zone — contains progress bar, time displays, and action buttons.
                </p>
                <CodeBlock>{`{
  "bottom": {
    "showProgress": true,
    "progressStyle": "ios",
    "normal": {
      "top": {
        "right": ["mega_seek"]
      },
      "left": ["time_current", "playlist", "shaders", "subtitles"],
      "right": ["server", "quality", "speed", "audio_track", "orientation", "aspect_ratio", "time_duration"]
    },
    "locked": {
      "left": ["time_current"],
      "right": ["time_duration"]
    }
  }
}`}</CodeBlock>
                <div className="overflow-x-auto rounded-lg border border-border/40 mt-3 mb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-card/40 border-b border-border/40">
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Section</th>
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                        <th className="text-left px-4 py-2 text-muted-foreground font-medium">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { s: "outside", d: "Three-column row displayed outside the panel", def: "(empty)" },
                        { s: "top", d: "Three-column row above the main controls", def: 'right: ["mega_seek"]' },
                        { s: "left", d: "Buttons on the left side", def: "time_current, playlist, shaders, subtitles" },
                        { s: "center", d: "Buttons in the center", def: "(empty)" },
                        { s: "right", d: "Buttons on the right side", def: "server, quality, speed, etc." },
                      ].map((row, i) => (
                        <tr key={row.s} className={i % 2 === 0 ? "bg-card/20" : ""}>
                          <td className="px-4 py-2"><code className="text-primary">{row.s}</code></td>
                          <td className="px-4 py-2 text-muted-foreground">{row.d}</td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">{row.def}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  <Icon icon="solar:info-circle-linear" width={14} className="inline mr-1" />
                  The progress bar is automatically inserted between the <code className="text-primary">top</code> row and the main <code className="text-primary">left</code>/<code className="text-primary">center</code>/<code className="text-primary">right</code> row (unless <code className="text-primary">showProgress</code> is false or a <code className="text-primary">progress_slider</code> item is manually placed).
                </p>
              </section>
            </section>

            {/* ==================== 8. ZONE ANIMATION & BEHAVIOR ==================== */}
            <section id="zone-animation-behavior">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:restart-linear" width={22} className="text-primary" />
                Zone Animation & Behavior
              </h2>
              <p className="text-muted-foreground mb-4">
                Each zone supports animation & behavior properties set directly on the zone object.
              </p>
              <CodeBlock>{`{
  "top": {
    "alignment": "topCenter",
    "padding": { "horizontal": 14, "vertical": 8 },
    "hiddenOffset": { "x": 0, "y": -1 },
    "slideDurationMs": 320,
    "opacityDurationMs": 260,
    "slideCurve": "easeOutCubic",
    "opacityCurve": "easeOut",
    "hiddenScale": 1.0,
    "scaleDurationMs": 300,
    "scaleCurve": "easeOutBack",
    "showWhenLocked": true,
    "showWhenUnlocked": true,
    "ignorePointerWhenHidden": true,
    "itemSpacing": 8,
    "groupSpacing": 10,
    "normal": { "left": [], "center": [], "right": [] }
  }
}`}</CodeBlock>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Alignment Options</h3>
              <div className="overflow-x-auto rounded-lg border border-border/40 mb-6">
                <table className="w-full text-sm">
                  <thead><tr className="bg-card/40 border-b border-border/40"><th className="text-left px-4 py-2 text-muted-foreground font-medium">Value</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th></tr></thead>
                  <tbody>
                    {[
                      ["topLeft", "Top-left corner"], ["topCenter", "Top-center (default for top zone)"], ["topRight", "Top-right corner"],
                      ["centerLeft", "Center-left"], ["center", "Dead center (default for middle zone)"], ["centerRight", "Center-right"],
                      ["bottomLeft", "Bottom-left corner"], ["bottomCenter", "Bottom-center (default for bottom zone)"], ["bottomRight", "Bottom-right corner"],
                    ].map(([val, desc], i) => (
                      <tr key={val} className={i % 2 === 0 ? "bg-card/20" : ""}><td className="px-4 py-1.5"><code className="text-primary text-xs">{val}</code></td><td className="px-4 py-1.5 text-muted-foreground">{desc}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-foreground mb-3">Animation & Behavior Properties</h3>
              <PropsTable rows={[
                { prop: "alignment", type: "string", def: "Zone-specific", desc: "How the zone is aligned" },
                { prop: "padding", type: "insets", def: "Zone-specific", desc: "Padding around the zone" },
                { prop: "hiddenOffset", type: "offset", def: "Zone-specific", desc: "Slide direction when hiding {x, y}" },
                { prop: "slideDurationMs", type: "int", def: "320", desc: "Slide animation duration (ms)" },
                { prop: "opacityDurationMs", type: "int", def: "260", desc: "Fade animation duration (ms)" },
                { prop: "slideCurve", type: "string", def: '"easeOutCubic"', desc: "Slide animation easing" },
                { prop: "opacityCurve", type: "string", def: '"easeOut"', desc: "Fade animation easing" },
                { prop: "hiddenScale", type: "double", def: "1.0", desc: "Scale when hidden (middle zone only)" },
                { prop: "scaleDurationMs", type: "int", def: "300", desc: "Scale animation duration (ms)" },
                { prop: "scaleCurve", type: "string", def: '"easeOutBack"', desc: "Scale animation easing" },
                { prop: "showWhenLocked", type: "bool", def: "Zone-specific", desc: "Whether zone shows in locked state" },
                { prop: "showWhenUnlocked", type: "bool", def: "Zone-specific", desc: "Whether zone shows in unlocked state" },
                { prop: "useNormalLayoutWhenLocked", type: "bool", def: "false", desc: "Use normal layout instead of locked layout" },
                { prop: "ignorePointerWhenHidden", type: "bool", def: "true", desc: "Block touches when zone is hidden" },
                { prop: "itemSpacing", type: "double", def: "8", desc: "Spacing between items within a row" },
                { prop: "groupSpacing", type: "double", def: "10", desc: "Spacing between left/center/right groups" },
                { prop: "topRowBottomSpacing", type: "double", def: "8", desc: "Space below the top row" },
                { prop: "progressBottomSpacing", type: "double", def: "10", desc: "Space below the progress bar" },
                { prop: "visibleWhen", type: "string?", def: "null", desc: "Conditional visibility expression" },
                { prop: "panelStyle", type: "object", def: "{}", desc: "Override panel style for this zone" },
                { prop: "absoluteCenter", type: "bool", def: "false", desc: "Stack center column absolutely (overlapping)" },
              ]} />

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Zone-Specific Defaults</h3>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead><tr className="bg-card/40 border-b border-border/40">
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Zone</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">alignment</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">padding</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">hiddenOffset</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">showWhenLocked</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">showWhenUnlocked</th>
                  </tr></thead>
                  <tbody>
                    {[
                      ["Top", "topCenter", "{h:14, v:8}", "{x:0, y:-1}", "true", "true"],
                      ["Middle", "center", "{h:14}", "{x:0, y:0}", "false", "true"],
                      ["Bottom", "bottomCenter", "{h:14, v:8}", "{x:0, y:1}", "true", "true"],
                    ].map(([zone, al, pad, off, sl, su], i) => (
                      <tr key={zone} className={i % 2 === 0 ? "bg-card/20" : ""}>
                        <td className="px-4 py-2 font-medium text-foreground">{zone}</td>
                        <td className="px-4 py-2"><code className="text-xs text-primary">{al}</code></td>
                        <td className="px-4 py-2"><code className="text-xs text-muted-foreground">{pad}</code></td>
                        <td className="px-4 py-2"><code className="text-xs text-muted-foreground">{off}</code></td>
                        <td className="px-4 py-2 text-muted-foreground">{sl}</td>
                        <td className="px-4 py-2 text-muted-foreground">{su}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ==================== 9. THEME ITEMS REFERENCE ==================== */}
            <section id="theme-items-reference">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:widget-add-linear" width={22} className="text-primary" />
                Theme Items Reference
              </h2>
              <p className="text-muted-foreground mb-4">
                Items are placed in zone layouts. They can be written as <strong className="text-foreground">shorthand strings</strong> or <strong className="text-foreground">full objects</strong>.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg border border-border/40 bg-card/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Shorthand (uses all defaults)</p>
                  <code className="text-primary text-sm">&quot;play_pause&quot;</code>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Full Object (with customization)</p>
                  <CodeBlock noBorder>{`{
  "id": "seek_back",
  "seconds": 5,
  "tooltip": "Rewind 5s",
  "icon": "replay_10_rounded",
  "visibleWhen": "!locked",
  "style": { "iconColor": "#FF5722" }
}`}</CodeBlock>
                </div>
              </div>

              {/* Buttons */}
              <section id="buttons" className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Buttons</h3>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-card/40 border-b border-border/40"><th className="text-left px-4 py-2 text-muted-foreground font-medium">Item ID</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Extra</th></tr></thead>
                    <tbody>
                      {[
                        ["back", "Go back / exit player", "—"],
                        ["lock_controls", "Lock the player", "Auto-hidden when already locked"],
                        ["unlock_controls", "Unlock the player", "Auto-hidden when already unlocked"],
                        ["toggle_fullscreen", "Toggle fullscreen", "—"],
                        ["open_settings", "Open player settings panel", "—"],
                        ["play_pause", "Play / Pause toggle", 'primary: true (uses primaryButton style)'],
                        ["previous_episode", "Go to previous episode", "Auto-disabled at start"],
                        ["next_episode", "Go to next episode", "Auto-disabled at end"],
                        ["seek_back", "Seek backward", "seconds (default: player setting)"],
                        ["seek_forward", "Seek forward", "seconds (default: player setting)"],
                        ["mega_seek", "Skip forward (long skip)", "seconds (default: player setting)"],
                        ["playlist", "Toggle episode playlist", "—"],
                        ["subtitles", "Toggle subtitle source pane", "—"],
                        ["source", "Toggle source selection", "—"],
                        ["server", "Toggle server selection", "Hidden when offline"],
                        ["quality", "Open video quality picker", "Hidden when offline"],
                        ["speed", "Open playback speed picker", "—"],
                        ["audio_track", "Toggle audio track pane", "—"],
                        ["tracks", "Toggle audio track pane (alias)", "—"],
                        ["shaders", "Open color profile settings", "—"],
                        ["orientation", "Toggle screen orientation", "Mobile only, hidden on desktop"],
                        ["aspect_ratio", "Toggle video fit mode", "Long-press resets to default"],
                      ].map(([id, desc, extra], i) => (
                        <tr key={id} className={i % 2 === 0 ? "bg-card/20" : ""}>
                          <td className="px-4 py-1.5"><code className="text-primary text-xs">{id}</code></td>
                          <td className="px-4 py-1.5 text-muted-foreground">{desc}</td>
                          <td className="px-4 py-1.5 text-xs text-muted-foreground">{extra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Display Elements */}
              <section id="display-elements" className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Display Elements</h3>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-card/40 border-b border-border/40"><th className="text-left px-4 py-2 text-muted-foreground font-medium">Item ID</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Extra</th></tr></thead>
                    <tbody>
                      {[
                        ["title", "Anime/media title (marquee scrolling)", "maxLines (default: 1)"],
                        ["episode_badge", "Episode number badge", "Uses chip style"],
                        ["series_badge", "Series name badge", "Uses chip style"],
                        ["quality_badge", 'Video quality badge (e.g., "1080p")', "Uses chip style"],
                        ["time_current", "Current playback position", "Uses chip style"],
                        ["time_duration", "Total episode duration", "Uses chip style"],
                        ["time_remaining", "Time remaining", "Uses chip style"],
                        ["progress_slider", "Inline progress bar", "See Progress Bar section"],
                      ].map(([id, desc, extra], i) => (
                        <tr key={id} className={i % 2 === 0 ? "bg-card/20" : ""}>
                          <td className="px-4 py-1.5"><code className="text-primary text-xs">{id}</code></td>
                          <td className="px-4 py-1.5 text-muted-foreground">{desc}</td>
                          <td className="px-4 py-1.5 text-xs text-muted-foreground">{extra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Layout Helpers */}
              <section id="layout-helpers" className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Layout Helpers</h3>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-card/40 border-b border-border/40"><th className="text-left px-4 py-2 text-muted-foreground font-medium">Item ID</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Extra</th></tr></thead>
                    <tbody>
                      {[
                        ["gap", "Fixed-size empty space", "size (default: 8), width, height"],
                        ["spacer", "Space that can become flexible", "size (default: 8), width, height, flex"],
                        ["flex_spacer", "Flexible expanding space", "flex (default: 1)"],
                      ].map(([id, desc, extra], i) => (
                        <tr key={id} className={i % 2 === 0 ? "bg-card/20" : ""}>
                          <td className="px-4 py-1.5"><code className="text-primary text-xs">{id}</code></td>
                          <td className="px-4 py-1.5 text-muted-foreground">{desc}</td>
                          <td className="px-4 py-1.5 text-xs text-muted-foreground">{extra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Rich Text Elements */}
              <section id="rich-text-elements" className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Rich Text Elements</h3>

                <h4 className="text-sm font-medium text-foreground mt-4 mb-2">watching_label</h4>
                <p className="text-xs text-muted-foreground mb-2">A two-line &quot;You&apos;re watching&quot; label with the title.</p>
                <CodeBlock>{`{
  "id": "watching_label",
  "topText": "Now Playing",
  "topFontSize": 11,
  "topFontWeight": "w400",
  "topColor": "rgba(255, 255, 255, 0.65)",
  "bottomFontSize": 14,
  "bottomFontWeight": "w700",
  "bottomColor": "#FFFFFF",
  "gap": 2,
  "textAlign": "left"
}`}</CodeBlock>

                <h4 className="text-sm font-medium text-foreground mt-6 mb-2">label_stack</h4>
                <p className="text-xs text-muted-foreground mb-2">A vertical stack of text lines, each with independent styling.</p>
                <CodeBlock>{`{
  "id": "label_stack",
  "textAlign": "left",
  "lines": [
    { "text": "Episode 5", "fontSize": 12, "fontWeight": "w500", "color": "#888" },
    { "source": "title", "fontSize": 16, "fontWeight": "w700", "color": "#FFF" },
    { "source": "quality", "fontSize": 11, "gap": 6 }
  ]
}`}</CodeBlock>
                <p className="text-xs text-muted-foreground mt-2">
                  Each line supports: <code className="text-primary">text</code>, <code className="text-primary">source</code> (title, episode, series, quality), <code className="text-primary">fontSize</code>, <code className="text-primary">fontWeight</code>, <code className="text-primary">color</code>, <code className="text-primary">textAlign</code>, <code className="text-primary">maxLines</code>, <code className="text-primary">gap</code>.
                </p>

                <h4 className="text-sm font-medium text-foreground mt-6 mb-2">text</h4>
                <p className="text-xs text-muted-foreground mb-2">A simple text element with optional dynamic source.</p>
                <CodeBlock>{`{
  "id": "text",
  "text": "Custom Label",
  "source": "title",
  "maxLines": 1,
  "textAlign": "left",
  "style": { "textColor": "#FFF", "fontSize": 14 }
}`}</CodeBlock>
              </section>
            </section>

            {/* ==================== 10. CONDITIONAL VISIBILITY ==================== */}
            <section id="conditional-visibility">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:eye-linear" width={22} className="text-primary" />
                Conditional Visibility & Enable
              </h2>
              <p className="text-muted-foreground mb-4">
                Items and zones support conditional expressions using <code className="text-primary">visibleWhen</code> and <code className="text-primary">enabledWhen</code>.
              </p>
              <CodeBlock noBorder>{`expression := or_expr
or_expr    := and_expr ('||' and_expr)*
and_expr   := token ('&&' token)*
token      := '!'? identifier`}</CodeBlock>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Available Tokens</h3>
              <div className="overflow-x-auto rounded-lg border border-border/40 mb-4">
                <table className="w-full text-sm">
                  <thead><tr className="bg-card/40 border-b border-border/40"><th className="text-left px-4 py-2 text-muted-foreground font-medium">Token</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th></tr></thead>
                  <tbody>
                    {[
                      ["locked", "Player is in locked state"], ["unlocked", "Player is not locked"],
                      ["showControls", "Controls are visible"], ["controlsHidden", "Controls are hidden"],
                      ["isPlaying", "Media is currently playing"], ["isBuffering", "Media is buffering"],
                      ["isOffline", "Playing downloaded/offline content"], ["isOnline", "Playing from online source"],
                      ["canGoForward", "Next episode is available"], ["canGoBackward", "Previous episode is available"],
                      ["isDesktop", "Running on desktop/tablet"], ["isMobile", "Running on phone"],
                    ].map(([token, desc], i) => (
                      <tr key={token} className={i % 2 === 0 ? "bg-card/20" : ""}>
                        <td className="px-4 py-1.5"><code className="text-primary text-xs">{token}</code></td>
                        <td className="px-4 py-1.5 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-medium text-foreground mb-3">Examples</h3>
              <CodeBlock>{`// Show only when not locked and online
"visibleWhen": "!locked && isOnline"

// Show only when playing
"visibleWhen": "isPlaying"

// Show when buffering or controls are visible
"visibleWhen": "isBuffering || showControls"

// Enable only when previous episode exists
"enabledWhen": "canGoBackward"

// Mobile-only button
"visibleWhen": "isMobile"`}</CodeBlock>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Per-Zone Visibility</h3>
              <CodeBlock>{`{
  "middle": {
    "visibleWhen": "isPlaying || isBuffering",
    "normal": {
      "items": ["play_pause"]
    }
  }
}`}</CodeBlock>
            </section>

            {/* ==================== 11. PROGRESS BAR CUSTOMIZATION ==================== */}
            <section id="progress-bar-customization">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:slider-horizontal-linear" width={22} className="text-primary" />
                Progress Bar Customization
              </h2>

              <h3 className="text-lg font-medium text-foreground mb-3">Via Bottom Zone Properties</h3>
              <CodeBlock>{`{
  "bottom": {
    "showProgress": true,
    "progressStyle": "ios",
    "progressPadding": { "horizontal": 4 },
    "progressActiveTrackColor": "#FF6B35",
    "progressInactiveTrackColor": "rgba(255, 255, 255, 0.2)",
    "progressSecondaryActiveTrackColor": "rgba(255, 107, 53, 0.4)",
    "progressThumbColor": "#FFFFFF",
    "progressOverlayColor": "rgba(255, 107, 53, 0.3)",
    "progressSegmentColor": null,
    "progressRecapSegmentColor": null
  }
}`}</CodeBlock>
              <PropsTable rows={[
                { prop: "showProgress", type: "bool", def: "true", desc: "Show the progress bar" },
                { prop: "progressStyle", type: "string", def: '"ios"', desc: '"ios" (iOS-style) or "capsule" (pill-shaped)' },
                { prop: "progressPadding", type: "insets", def: "—", desc: "Padding around the progress bar" },
                { prop: "progressActiveTrackColor", type: "string?", def: "null", desc: "Color of the played portion" },
                { prop: "progressInactiveTrackColor", type: "string?", def: "null", desc: "Color of the unplayed portion" },
                { prop: "progressSecondaryActiveTrackColor", type: "string?", def: "null", desc: "Color of the buffered portion" },
                { prop: "progressThumbColor", type: "string?", def: "null", desc: "Color of the draggable thumb" },
                { prop: "progressOverlayColor", type: "string?", def: "null", desc: "Color of the touch overlay" },
                { prop: "progressSegmentColor", type: "string?", def: "null", desc: "Color of segment markers" },
                { prop: "progressRecapSegmentColor", type: "string?", def: "null", desc: "Color of recap/intro segments" },
              ]} />

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Via Inline progress_slider Item</h3>
              <CodeBlock>{`{
  "id": "progress_slider",
  "progressStyle": "capsule",
  "activeTrackColor": "#FF6B35",
  "inactiveTrackColor": "rgba(255, 255, 255, 0.2)",
  "thumbColor": "#FFF"
}`}</CodeBlock>
              <p className="text-xs text-muted-foreground mt-3">
                <Icon icon="solar:info-circle-linear" width={14} className="inline mr-1" />
                When a <code className="text-primary">progress_slider</code> item is manually placed, the auto-generated progress bar is not added.
              </p>
            </section>

            {/* ==================== 12. CUSTOM ICONS ==================== */}
            <section id="custom-icons">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:sticker-smile-circle-2-linear" width={22} className="text-primary" />
                Custom Icons
              </h2>
              <p className="text-muted-foreground mb-4">
                Override the default icon for any button using the <code className="text-primary">icon</code> property:
              </p>
              <CodeBlock noBorder>{`{
  "id": "seek_back",
  "icon": "replay_30_rounded",
  "seconds": 30
}`}</CodeBlock>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Supported Icon Names</h3>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead><tr className="bg-card/40 border-b border-border/40"><th className="text-left px-4 py-2 text-muted-foreground font-medium">Name</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th></tr></thead>
                  <tbody>
                    {[
                      ["arrow_back_rounded", "Back arrow"], ["lock_rounded", "Lock"], ["lock_open_rounded", "Unlock"],
                      ["fullscreen_rounded", "Fullscreen"], ["fullscreen_exit_rounded", "Exit fullscreen"],
                      ["settings_rounded", "Settings gear"], ["skip_previous_rounded", "Skip to previous"],
                      ["skip_next_rounded", "Skip to next"], ["replay_10_rounded", "Replay 10 seconds"],
                      ["forward_10_rounded", "Forward 10 seconds"], ["replay_30_rounded", "Replay 30 seconds"],
                      ["forward_30_rounded", "Forward 30 seconds"], ["play_arrow_rounded", "Play"],
                      ["pause_rounded", "Pause"], ["fast_forward_rounded", "Fast forward / mega seek"],
                      ["screen_rotation_rounded", "Screen rotation"], ["more_vert_rounded", "More options (vertical dots)"],
                      ["playlist_play_rounded", "Playlist"], ["tune_rounded", "Tune / adjust"],
                      ["subtitles_rounded", "Subtitles"], ["cloud_rounded", "Cloud / server"],
                      ["high_quality_rounded", "High quality"], ["speed_rounded", "Speed"],
                      ["music_note_rounded", "Music note / audio"], ["fit_screen", "Fit to screen"],
                    ].map(([name, desc], i) => (
                      <tr key={name} className={i % 2 === 0 ? "bg-card/20" : ""}>
                        <td className="px-4 py-1.5"><code className="text-primary text-xs">{name}</code></td>
                        <td className="px-4 py-1.5 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ==================== 13. PER-ITEM STYLE OVERRIDES ==================== */}
            <section id="per-item-style-overrides">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:magic-stick-3-linear" width={22} className="text-primary" />
                Per-Item Style Overrides
              </h2>
              <p className="text-muted-foreground mb-4">
                Any item can override global styles using the <code className="text-primary">style</code> property. The object is merged with the relevant global style.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-3">Button Items</h3>
              <CodeBlock>{`{
  "id": "play_pause",
  "primary": true,
  "style": {
    "size": 56,
    "iconSize": 30,
    "radius": 28,
    "color": "rgba(255, 107, 53, 0.3)",
    "borderColor": "rgba(255, 107, 53, 0.5)",
    "iconColor": "#FF6B35"
  }
}`}</CodeBlock>
              <p className="text-xs text-muted-foreground mt-2">
                Set <code className="text-primary">"primary": true</code> to use the primaryButton style as base. Set <code className="text-primary">"primary": false</code> to use button style.
              </p>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Badge / Chip Items</h3>
              <CodeBlock>{`{
  "id": "episode_badge",
  "style": {
    "radius": 8,
    "color": "rgba(255, 107, 53, 0.2)",
    "textColor": "#FF6B35",
    "fontSize": 11,
    "fontWeight": "w500"
  }
}`}</CodeBlock>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Text Items</h3>
              <CodeBlock>{`{
  "id": "title",
  "style": {
    "textColor": "#FFFFFF",
    "fontSize": 16,
    "fontWeight": "w600",
    "letterSpacing": 0.1
  }
}`}</CodeBlock>
            </section>

            {/* ==================== 14. INSETS & SPACING ==================== */}
            <section id="insets-spacing">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:ruler-angular-linear" width={22} className="text-primary" />
                Insets & Spacing Format
              </h2>
              <p className="text-muted-foreground mb-4">Padding, insets, and offsets use a flexible object format:</p>

              <h3 className="text-lg font-medium text-foreground mb-3">EdgeInsets (Padding)</h3>
              <CodeBlock>{`// All sides equal
{ "all": 8 }

// Horizontal + vertical shorthand
{ "horizontal": 12, "vertical": 10 }

// Full control
{ "left": 4, "top": 8, "right": 4, "bottom": 8 }

// Short aliases
{ "h": 14, "v": 8 }`}</CodeBlock>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Offset</h3>
              <CodeBlock>{`// Object format
{ "x": 0, "y": -1 }

// Array format
[0, -1]`}</CodeBlock>
            </section>

            {/* ==================== 15. ANIMATION CURVES ==================== */}
            <section id="animation-curves">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:graph-up-linear" width={22} className="text-primary" />
                Animation Curves Reference
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead><tr className="bg-card/40 border-b border-border/40"><th className="text-left px-4 py-2 text-muted-foreground font-medium">Curve Name</th><th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th></tr></thead>
                  <tbody>
                    {[
                      ["linear", "Constant speed, no easing"],
                      ["easeIn", "Starts slow, accelerates"],
                      ["easeOut", "Starts fast, decelerates"],
                      ["easeInOut", "Slow start and end, fast middle"],
                      ["easeOutCubic", "Smooth deceleration (default for slide)"],
                      ["easeOutBack", 'Overshoots slightly then settles (default for scale)'],
                    ].map(([name, desc], i) => (
                      <tr key={name} className={i % 2 === 0 ? "bg-card/20" : ""}>
                        <td className="px-4 py-1.5"><code className="text-primary text-xs">{name}</code></td>
                        <td className="px-4 py-1.5 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ==================== 16. LOCKED PLAYER STATE ==================== */}
            <section id="locked-player-state">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:lock-linear" width={22} className="text-primary" />
                Locked Player State
              </h2>
              <p className="text-muted-foreground mb-4">When the player is <strong className="text-foreground">locked</strong>:</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc list-inside">
                <li>Touch gestures on the video area are disabled (prevent accidental taps)</li>
                <li>Each zone can define a separate <code className="text-primary">locked</code> layout</li>
                <li>If no locked layout is provided: top zone shows only the unlock button, middle zone is hidden, bottom zone shows only time labels</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mb-3">Example: Minimal Locked Layout</h3>
              <CodeBlock>{`{
  "top": {
    "locked": {
      "left": ["back"],
      "right": ["unlock_controls"]
    }
  },
  "bottom": {
    "locked": {
      "left": ["time_current"],
      "center": ["progress_slider"],
      "right": ["time_duration"]
    }
  }
}`}</CodeBlock>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Show Normal Layout When Locked</h3>
              <CodeBlock noBorder>{`{
  "top": {
    "useNormalLayoutWhenLocked": true
  }
}`}</CodeBlock>
            </section>

            {/* ==================== 17. COMPLETE EXAMPLE ==================== */}
            <section id="complete-example">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:star-bold" width={22} className="text-primary" />
                Complete Example Theme
              </h2>
              <p className="text-muted-foreground mb-4">
                Here is a full-featured theme demonstrating many options:
              </p>
              <CodeBlock>{`{
  "id": "example_neon_theme",
  "name": "Neon Glow",

  "palette": {
    "bg": "rgba(10, 10, 30, 0.7)",
    "accent": "#00E5FF",
    "accentDim": "rgba(0, 229, 255, 0.3)",
    "text": "#FFFFFF",
    "textMuted": "rgba(255, 255, 255, 0.6)",
    "success": "#00E676",
    "warn": "#FF9100"
  },

  "styles": {
    "panel": {
      "color": "@bg",
      "borderColor": "@accentDim",
      "borderWidth": 1,
      "blur": 24,
      "radius": 16,
      "shadowColor": "rgba(0, 229, 255, 0.15)",
      "shadowBlur": 24,
      "shadowOffsetY": 4
    },
    "button": {
      "size": 38,
      "iconSize": 18,
      "radius": 12,
      "color": "@bg",
      "borderColor": "@accentDim",
      "borderWidth": 0.6,
      "iconColor": "@text",
      "blur": 12
    },
    "primaryButton": {
      "size": 52,
      "iconSize": 28,
      "radius": 26,
      "color": "rgba(0, 229, 255, 0.2)",
      "borderColor": "@accent",
      "borderWidth": 1.2,
      "iconColor": "@accent",
      "blur": 16
    },
    "chip": {
      "radius": 10,
      "color": "rgba(0, 229, 255, 0.15)",
      "textColor": "@accent",
      "borderColor": "rgba(0, 229, 255, 0.25)",
      "borderWidth": 0.6,
      "fontSize": 11,
      "fontWeight": "w600"
    },
    "text": {
      "textColor": "@text",
      "fontSize": 14,
      "fontWeight": "w700",
      "letterSpacing": 0.1
    }
  },

  "top": {
    "alignment": "topCenter",
    "padding": { "horizontal": 12, "vertical": 6 },
    "itemSpacing": 6,
    "slideDurationMs": 280,
    "showWhenLocked": true,
    "normal": {
      "left": ["back"],
      "center": ["title", "episode_badge", "series_badge"],
      "right": ["lock_controls", "toggle_fullscreen", "open_settings"]
    },
    "locked": { "right": ["unlock_controls"] }
  },

  "middle": {
    "itemSpacing": 10,
    "hiddenScale": 0.8,
    "scaleDurationMs": 250,
    "normal": {
      "items": [
        { "id": "previous_episode", "visibleWhen": "canGoBackward" },
        { "id": "seek_back", "seconds": 10, "icon": "replay_10_rounded" },
        { "id": "play_pause", "primary": true },
        { "id": "seek_forward", "seconds": 10, "icon": "forward_10_rounded" },
        { "id": "next_episode", "visibleWhen": "canGoForward" }
      ]
    }
  },

  "bottom": {
    "showProgress": true,
    "progressStyle": "capsule",
    "progressActiveTrackColor": "@accent",
    "progressInactiveTrackColor": "rgba(255, 255, 255, 0.15)",
    "progressThumbColor": "@accent",
    "progressOverlayColor": "rgba(0, 229, 255, 0.3)",
    "progressPadding": { "horizontal": 8 },
    "normal": {
      "top": { "right": [{ "id": "mega_seek", "seconds": 30 }] },
      "left": ["time_current", "playlist", { "id": "subtitles", "visibleWhen": "!isOffline" }],
      "right": [
        { "id": "quality", "visibleWhen": "!isOffline" },
        "speed", "audio_track",
        { "id": "orientation", "visibleWhen": "isMobile" },
        "aspect_ratio",
        "time_duration"
      ]
    },
    "locked": { "left": ["time_current"], "right": ["time_duration"] }
  }
}`}</CodeBlock>
            </section>

            {/* ==================== 18. TIPS ==================== */}
            <section id="tips-best-practices">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:lightbulb-linear" width={22} className="text-primary" />
                Tips & Best Practices
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Start Minimal", desc: "Don't write everything from scratch. Start with just an id and customize incrementally. All defaults are well-designed." },
                  { title: "Use the Palette", desc: 'Define your colors in palette and reference them with @keyName. This makes it easy to change the color scheme without editing every property.', code: '{\n  "palette": {\n    "accent": "#FF6B35",\n    "bg": "rgba(0, 0, 0, 0.5)"\n  }\n}' },
                  { title: "Test on the App", desc: 'Import your JSON in AnymeX via Settings > Player > Player Control Theme to preview it live. The parser will report any errors or warnings.' },
                  { title: "Use dynamic() for Theme Compatibility", desc: 'Colors using dynamic() automatically adapt to the user\'s app theme (light/dark).', code: '{\n  "styles": {\n    "button": {\n      "iconColor": "dynamic(onSurface)",\n      "color": "dynamic(surfaceVariant, 0.5)"\n    }\n  }\n}' },
                  { title: "Respect Mobile vs Desktop", desc: 'Some items are platform-specific: orientation is hidden on desktop; server and quality are hidden when offline. Use visibleWhen for additional control.', code: '{ "id": "orientation", "visibleWhen": "isMobile" }' },
                  { title: "Keep the Locked State Simple", desc: "The locked state should show minimal controls. The default (just unlock button) is recommended." },
                  { title: "Use Tooltips", desc: "Always add tooltips to buttons for better UX, especially when using custom icons." },
                  { title: "Theme ID Rules", desc: 'Must be unique. Use lowercase, underscores, or hyphens. Examples: "my_neon_theme", "minimal-dark", "cinema_v2".' },
                ].map((tip) => (
                  <div key={tip.title} className="glass-surface rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Icon icon="solar:check-circle-linear" className="text-green-500 shrink-0 mt-0.5" width={18} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground mb-1">{tip.title}</h3>
                        <p className="text-xs text-muted-foreground">{tip.desc}</p>
                        {tip.code && (
                          <CodeBlock noBorder>{tip.code}</CodeBlock>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ==================== 19. TROUBLESHOOTING ==================== */}
            <section id="troubleshooting">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:danger-triangle-linear" width={22} className="text-yellow-500" />
                Troubleshooting
              </h2>
              <div className="space-y-4">
                {[
                  { error: '"Theme id is required"', solution: "The theme object must have an \"id\" field. Check your JSON structure." },
                  { error: '"Invalid JSON syntax"', solution: "Your JSON has a syntax error. Use a JSON validator (e.g., jsonlint.com) to find the issue." },
                  { error: '"Theme uses unsupported item id"', solution: "An item ID in your theme is not recognized. Check the Theme Items Reference for valid IDs. The theme will still load, but that item will be ignored." },
                  { error: '"No themes found in payload"', solution: "The JSON structure doesn't contain any theme objects. Make sure your themes are wrapped correctly (see Theme Collection Formats)." },
                  { error: "Buttons Don't Appear", solution: "Check if the item ID is correct. Check if visibleWhen is hiding the item. Some buttons auto-hide (server hides when offline, orientation hides on desktop)." },
                  { error: "Progress Bar Not Showing", solution: 'Check showProgress is true (default). If you have a progress_slider item in any bottom row, it replaces the auto-generated one. Check if the bottom zone is visible (showWhenUnlocked / showWhenLocked).' },
                  { error: "Colors Not Working", solution: "Ensure the color format is correct. Check that palette references use @ prefix correctly. dynamic() colors depend on the user's app theme — test with different themes." },
                ].map((item) => (
                  <div key={item.error} className="rounded-lg border border-border/40 bg-card/30 p-4">
                    <p className="text-sm font-medium text-yellow-500 mb-1">{item.error}</p>
                    <p className="text-xs text-muted-foreground">{item.solution}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ==================== DIVIDER ==================== */}
            <div className="flex items-center gap-4 my-12">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Site Guide</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>

            {/* ==================== BECOMING A CREATOR ==================== */}
            <section id="becoming-creator">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:user-plus-rounded-linear" width={22} className="text-primary" />
                Becoming a Theme Creator
              </h2>
              <div className="glass-surface rounded-xl p-6">
                <p className="text-muted-foreground mb-4">
                  To share your themes with the community, you&apos;ll need to register as a theme creator first. Here&apos;s how:
                </p>
                <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
                  <li>Go to the main page and click on <strong>Sign In</strong> in the navigation menu</li>
                  <li>Click the <strong>Register</strong> tab to create your account</li>
                  <li>Fill in your details:
                    <ul className="list-disc list-inside ml-6 mt-2 text-neutral-400 space-y-1">
                      <li><strong>Username</strong> (required) - Your unique identifier</li>
                      <li><strong>Password</strong> (required) - At least 6 characters</li>
                      <li><strong>Profile URL</strong> (optional) - Your GitHub, social media, or any profile link. This link will be shown when users click on your name next to your themes</li>
                      <li><strong>Discord User ID</strong> (optional) - Your Discord numeric user ID. This is used to assign you the <strong>Theme Creator role</strong> on the AnymeX Discord server so you get special perks and recognition. <span className="text-primary">See below for how to find it.</span></li>
                    </ul>
                  </li>
                  <li>Submit and you&apos;ll be redirected to the Creator Dashboard</li>
                </ol>
                <div className="mt-6 p-4 rounded-lg border border-neutral-800 bg-neutral-950/50">
                  <p className="text-sm text-neutral-300 font-medium mb-3 flex items-center gap-2">
                    <Icon icon="solar:chat-round-dots-linear" className="text-indigo-400" width={16} />
                    How to Get Your Discord User ID
                  </p>
                  <ol className="space-y-2 text-sm text-neutral-400 list-decimal list-inside">
                    <li>Open <strong>Discord</strong> and go to <strong>Settings</strong> (the gear icon near your username)</li>
                    <li>Navigate to <strong>Advanced</strong> (under the &quot;App Settings&quot; section)</li>
                    <li>Turn on <strong>Developer Mode</strong></li>
                    <li>Go back and <strong>right-click your own profile picture</strong> in any server or DM</li>
                    <li>Click <strong>&quot;Copy User ID&quot;</strong></li>
                    <li>Paste it into the registration form — it&apos;s a long number like <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">123456789012345678</code></li>
                  </ol>
                  <div className="mt-3 p-3 rounded-md bg-indigo-500/5 border border-indigo-500/20">
                    <p className="text-xs text-neutral-400">
                      <Icon icon="solar:shield-check-linear" className="inline mr-1 text-indigo-400" width={13} />
                      Once registered, your Discord role will be assigned automatically. If it doesn&apos;t happen right away, contact an admin on the server.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== UPLOADING YOUR THEME ==================== */}
            <section id="uploading-theme">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:upload-minimalistic-linear" width={22} className="text-primary" />
                Uploading Your Theme
              </h2>
              <div className="glass-surface rounded-xl p-6">
                <p className="text-muted-foreground mb-4">
                  Once you&apos;ve created your theme JSON and registered as a creator, you can upload it through the Creator Dashboard:
                </p>
                <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
                  <li>Log in to your creator account at <strong>/auth</strong></li>
                  <li>Go to the <strong>Creator Dashboard</strong></li>
                  <li>Click the <strong>&quot;Create New Theme&quot;</strong> button</li>
                  <li>Fill in the theme details:
                    <ul className="list-disc list-inside ml-6 mt-2 text-neutral-400 space-y-1">
                      <li><strong>Theme Name</strong> - Display name for your theme</li>
                      <li><strong>Description</strong> - Brief description of your theme&apos;s style</li>
                      <li><strong>Category</strong> - Dark, Light, or AMOLED</li>
                    </ul>
                  </li>
                  <li><strong>Upload your theme JSON file</strong> - Click or drag and drop your JSON file (it will auto-fill the name, description, and category if your JSON includes them)</li>
                  <li>Click <strong>&quot;Upload Theme&quot;</strong> to submit</li>
                  <li>Your theme is <strong>immediately visible</strong> to all users!</li>
                </ol>
              </div>
            </section>

            {/* ==================== APPLYING THEMES ==================== */}
            <section id="applying-themes">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:download-minimalistic-linear" width={22} className="text-primary" />
                Applying Themes to AnymeX
              </h2>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
                <p className="text-neutral-400 mb-4">
                  Once your theme is visible on the main page, users can apply it to their AnymeX with a single click:
                </p>
                <ol className="space-y-3 text-neutral-300 list-decimal list-inside">
                  <li>Find your theme in the <strong>Themes Gallery</strong> on the main page</li>
                  <li>Click the <strong>&quot;Apply&quot;</strong> button on the theme card</li>
                  <li>AnymeX will open automatically and the theme will be added to your collection</li>
                  <li>Switch to your new theme in AnymeX settings</li>
                </ol>
                <div className="mt-6 p-4 rounded-lg border border-neutral-800 bg-neutral-950/50">
                  <p className="text-sm text-neutral-400 mb-2">
                    <Icon icon="solar:info-circle-linear" className="inline mr-2" width={16} />
                    <strong>How it works:</strong> The Apply button uses a deep link that tells the AnymeX app which theme to download:
                  </p>
                  <p className="text-sm text-neutral-500 mt-2 font-mono">
                    anymex://theme?type=player&amp;url=https://theme.json
                  </p>
                </div>
              </div>
            </section>

            {/* ==================== SWITCHING THEMES ==================== */}
            <section id="switching-themes">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:refresh-circle-linear" width={22} className="text-primary" />
                Switching Between Themes in AnymeX
              </h2>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
                <p className="text-neutral-400 mb-4">
                  After clicking &quot;Apply&quot; and the theme is added to your collection, you can switch between themes anytime:
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
              </div>
            </section>

            {/* ==================== PROFILE URL ==================== */}
            <section id="profile-url">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon icon="solar:link-horizontal-linear" width={22} className="text-primary" />
                Profile URL Feature
              </h2>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
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
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/30 bg-card/10 backdrop-blur-sm py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/50">&copy; 2025 AnymeX. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-200">
              Back to Themes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ==================== HELPER COMPONENTS ==================== */

function CodeBlock({ children, noBorder }: { children: string; noBorder?: boolean }) {
  return (
    <div className={`overflow-x-auto ${noBorder ? "" : "bg-background/50 rounded-lg p-4 border border-border/30"}`}>
      <pre className={`text-sm text-neutral-300 font-mono whitespace-pre ${noBorder ? "mt-2" : ""}`}>{children}</pre>
    </div>
  );
}

function PropsTable({ rows }: { rows: { prop: string; type: string; def: string; desc: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-card/40 border-b border-border/40">
            <th className="text-left px-4 py-2 text-muted-foreground font-medium">Property</th>
            <th className="text-left px-4 py-2 text-muted-foreground font-medium">Type</th>
            <th className="text-left px-4 py-2 text-muted-foreground font-medium">Default</th>
            <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.prop} className={i % 2 === 0 ? "bg-card/20" : ""}>
              <td className="px-4 py-1.5"><code className="text-primary text-xs">{row.prop}</code></td>
              <td className="px-4 py-1.5"><code className="text-xs text-muted-foreground">{row.type}</code></td>
              <td className="px-4 py-1.5"><code className="text-xs text-muted-foreground">{row.def}</code></td>
              <td className="px-4 py-1.5 text-muted-foreground">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
