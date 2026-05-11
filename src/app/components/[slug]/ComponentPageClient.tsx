"use client";

import { useState, useMemo, useCallback } from "react";
import type { ComponentMeta } from "@/lib/component-registry";
import ComponentPreview from "@/components/ComponentPreview";
import CodeBlock from "@/components/CodeBlock";
import PropTable from "@/components/PropTable";
import ColorPicker, { ColorArrayPicker } from "@/components/ColorPicker";
import {
  ArrowLeft,
  Eye,
  Code2,
  Copy,
  Check,
  RotateCcw,
  Heart,
  Terminal,
  Download,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";




/* ────────────────────────────────────────────────────
   Determine the right control for a prop
   ──────────────────────────────────────────────────── */
type ControlType = "number" | "boolean" | "color" | "color[]" | "text" | "select" | "array";

function getControlType(propType: string, propDefault?: string): ControlType {
  if (propType === "number") return "number";
  if (propType === "boolean") return "boolean";
  if (propType === "color[]" || propType === "string[]") {
    if (propDefault && (propDefault.includes("#") || propType === "color[]")) return "color[]";
    return "array";
  }
  if (propType.includes("'") && propType.includes("|")) return "select";
  if (propDefault?.startsWith('"#') || propDefault?.startsWith("'#"))
    return "color";
  return "text";
}

function parseDefaultValue(
  defaultStr: string | undefined,
  propType: string
): unknown {
  if (!defaultStr) return undefined;
  if (propType === "number") return parseFloat(defaultStr) || 0;
  if (propType === "boolean") return defaultStr === "true";
  if (propType === "string[]") {
    try {
      return JSON.parse(defaultStr);
    } catch {
      return defaultStr
        .replace(/[\[\]"']/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return defaultStr.replace(/^["']|["']$/g, "");
}

function getSelectOptions(propType: string): string[] {
  const matches = propType.match(/'([^']+)'/g);
  return matches ? matches.map((m) => m.replace(/'/g, "")) : [];
}

function getSliderConfig(defaultVal: number) {
  if (defaultVal <= 1) return { min: 0, max: 2, step: 0.01 };
  if (defaultVal <= 10) return { min: 0, max: 50, step: 0.5 };
  if (defaultVal <= 100) return { min: 0, max: 500, step: 1 };
  return { min: 0, max: 2000, step: 10 };
}

/* ────────────────────────────────────────────────────
   Props interface — data comes from the Server Component
   ──────────────────────────────────────────────────── */
interface ComponentPageClientProps {
  slug: string;
  metadata: ComponentMeta;
  tsxCode: string | null;
  jsxCode: string | null;
  cssCode: string | null;
}

/* ────────────────────────────────────────────────────
   CLI Install Panel — Phase 8
   ──────────────────────────────────────────────────── */
function CLIPanel({
  slug,
  shadcnCommand,
  depsCommand,
  usageCode,
  dependencies,
}: {
  slug: string;
  shadcnCommand: string;
  depsCommand: string | null;
  usageCode: string;
  dependencies: string[];
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={styles.cliPanel}>
      {/* shadcn CLI install */}
      <div className={styles.cliSection}>
        <div className={styles.cliSectionHeader}>
          <Terminal size={14} className={styles.cliSectionIcon} />
          <span className={styles.cliSectionTitle}>Install via shadcn CLI</span>
        </div>
        <div className={styles.cliCommandBox}>
          <code className={styles.cliCommandText}>{shadcnCommand}</code>
          <button
            className={
              copiedField === "shadcn"
                ? styles.cliCopyBtnCopied
                : styles.cliCopyBtn
            }
            onClick={() => copyToClipboard(shadcnCommand, "shadcn")}
          >
            {copiedField === "shadcn" ? (
              <Check size={12} />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      </div>

      {/* Dependencies */}
      {depsCommand && (
        <div className={styles.cliSection}>
          <div className={styles.cliSectionHeader}>
            <Download size={14} className={styles.cliSectionIcon} />
            <span className={styles.cliSectionTitle}>Dependencies</span>
          </div>
          <div className={styles.cliCommandBox}>
            <code className={styles.cliCommandText}>{depsCommand}</code>
            <button
              className={
                copiedField === "deps"
                  ? styles.cliCopyBtnCopied
                  : styles.cliCopyBtn
              }
              onClick={() => copyToClipboard(depsCommand, "deps")}
            >
              {copiedField === "deps" ? (
                <Check size={12} />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
          <div className={styles.cliDepLinks}>
            {dependencies.map((dep) => (
              <a
                key={dep}
                href={`https://www.npmjs.com/package/${dep}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cliDepLink}
              >
                {dep}
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Manual install */}
      <div className={styles.cliSection}>
        <div className={styles.cliSectionHeader}>
          <Code2 size={14} className={styles.cliSectionIcon} />
          <span className={styles.cliSectionTitle}>Install manually</span>
        </div>
        <p className={styles.cliManualText}>
          Copy the TypeScript or JavaScript code from the tabs above and paste
          into your project at{" "}
          <code className={styles.cliInlineCode}>
            components/ui/{slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}.tsx
          </code>
        </p>
      </div>

      {/* Usage */}
      <div className={styles.cliSection}>
        <div className={styles.cliSectionHeader}>
          <Eye size={14} className={styles.cliSectionIcon} />
          <span className={styles.cliSectionTitle}>Usage</span>
        </div>
        <div className={styles.cliUsageBox}>
          <div className={styles.cliUsageHeader}>
            <span className={styles.cliUsageFilename}>Example.tsx</span>
            <button
              className={
                copiedField === "usage"
                  ? styles.cliCopyBtnCopied
                  : styles.cliCopyBtn
              }
              onClick={() => copyToClipboard(usageCode, "usage")}
            >
              {copiedField === "usage" ? (
                <Check size={12} />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
          <pre className={styles.cliUsagePre}>
            <code>{usageCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Client Component
   ──────────────────────────────────────────────────── */
export default function ComponentPageClient({
  slug,
  metadata: component,
  tsxCode,
  jsxCode,
  cssCode,
}: ComponentPageClientProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [codeSubTab, setCodeSubTab] = useState<"ts" | "js" | "css" | "usage" | "cli">("ts");
  const [showDemoContent, setShowDemoContent] = useState(true);
  const [customProps, setCustomProps] = useState<Record<string, unknown>>({});
  const [reloadKey, setReloadKey] = useState(0);

  // Source code: served from filesystem (Phase 2) + generated .jsx (Phase 6)
  const displayTsxCode = tsxCode || "// Source file not found";
  const displayJsxCode = jsxCode || "// JavaScript variant not available.\n// Run: npm run generate:js";
  const displayCssCode = cssCode || "/* No CSS for this component */";

  // Auto-generate Usage tab code from mergedProps
  const generateUsageCode = useCallback(
    (componentName: string, props: Record<string, unknown>): string => {
      const cleanName = componentName.replace(/\s+/g, "");
      const propEntries = Object.entries(props).filter(
        ([key]) => key !== "children" && key !== "className" && key !== "onClick" && key !== "ref"
      );

      const propsStr = propEntries
        .map(([key, value]) => {
          if (typeof value === "boolean") return `      ${key}={${value}}`;
          if (typeof value === "number") return `      ${key}={${value}}`;
          if (typeof value === "string") return `      ${key}="${value}"`;
          if (Array.isArray(value)) return `      ${key}={${JSON.stringify(value)}}`;
          return `      ${key}={${JSON.stringify(value)}}`;
        })
        .join("\n");

      return [
        `import ${cleanName} from '@/components/ui/${cleanName}';`,
        "",
        "export default function Example() {",
        "  return (",
        `    <${cleanName}`,
        propsStr,
        "    />",
        "  );",
        "}",
      ].join("\n");
    },
    []
  );

  // Initialize custom props from defaults
  const defaultPropValues = useMemo(() => {
    if (!component?.props) return {};
    const vals: Record<string, unknown> = {};
    for (const p of component.props) {
      if (
        p.name === "children" ||
        p.name === "className" ||
        p.name === "onClick"
      )
        continue;
      const val = parseDefaultValue(p.default, p.type);
      if (val !== undefined) vals[p.name] = val;
    }
    return vals;
  }, [component]);

  const mergedProps = useMemo(
    () => ({ ...defaultPropValues, ...customProps }),
    [defaultPropValues, customProps]
  );

  const updateProp = useCallback((name: string, value: unknown) => {
    setCustomProps((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetProps = useCallback(() => setCustomProps({}), []);

  const usageCode = useMemo(
    () => generateUsageCode(component.name, mergedProps),
    [component, mergedProps, generateUsageCode]
  );



  // CLI install commands
  const shadcnCommand = `npx shadcn@latest add https://legitui.com/registry/shadcn/${slug}.json`;
  const depsCommand = (component.dependencies && component.dependencies.length > 0)
    ? `npm install ${component.dependencies.join(" ")}`
    : null;

  // Filter props to show in customize panel
  const customizableProps = (component.props || []).filter(
    (p) =>
      p.name !== "children" &&
      p.name !== "className" &&
      p.name !== "onClick" &&
      p.name !== "ref"
  );

  return (
    <div className={styles.pageWrapper} suppressHydrationWarning>
      {/* ====== MAIN CONTENT ====== */}
      <div className={styles.mainContent}>
        {/* Title */}
        <div className={styles.titleSection}>
          <div className={styles.titleRow}>
            <h1 className={styles.componentTitle}>{component.name}</h1>
            {component.isNew && <span className={styles.newBadge}>NEW</span>}
          </div>
          <p className={styles.componentDesc}>{component.description}</p>
        </div>

        {/* ====== PREVIEW PANEL ====== */}
        <div className={styles.previewPanel}>
          {/* Top Bar */}
          <div className={styles.panelTopBar}>
            <div className={styles.panelLeft}>
              <div className={styles.pillTabs}>
                <button
                  className={
                    activeTab === "preview"
                      ? styles.pillTabActive
                      : styles.pillTab
                  }
                  onClick={() => setActiveTab("preview")}
                  suppressHydrationWarning
                >
                  <Eye size={13} />
                  Preview
                </button>
                <button
                  className={
                    activeTab === "code" ? styles.pillTabActive : styles.pillTab
                  }
                  onClick={() => setActiveTab("code")}
                  suppressHydrationWarning
                >
                  <Code2 size={13} />
                  Code
                </button>
              </div>
            </div>

            <div className={styles.panelRight}>
              {component.category === "TextAnimations" && (
                <button
                  onClick={() => setReloadKey(k => k + 1)}
                  className={styles.actionBtn}
                  suppressHydrationWarning
                >
                  <RotateCcw size={12} />
                  Reload
                </button>
              )}
              <Link
                href={`/preview/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtn}
              >
                <ExternalLink size={12} />
                Open in new tab
              </Link>
            </div>
          </div>

          {/* Preview Canvas */}
          {activeTab === "preview" && (
            <>
              <div className={styles.previewCanvas}>
                <span className={`${styles.cornerDot} ${styles.cornerDotTL}`} />
                <span className={`${styles.cornerDot} ${styles.cornerDotTR}`} />
                <span className={`${styles.cornerDot} ${styles.cornerDotBL}`} />
                <span className={`${styles.cornerDot} ${styles.cornerDotBR}`} />
                <span className={`${styles.cornerDot} ${styles.cornerDotMT}`} />
                <span className={`${styles.cornerDot} ${styles.cornerDotMB}`} />
                <span className={`${styles.cornerDot} ${styles.cornerDotML}`} />
                <span className={`${styles.cornerDot} ${styles.cornerDotMR}`} />

                <ComponentPreview
                  key={reloadKey}
                  slug={slug}
                  initialProps={defaultPropValues}
                  currentProps={mergedProps}
                  showDemoContent={showDemoContent}
                  componentName={component.name}
                  componentDesc={component.description}
                />
              </div>

              {/* Demo content toggle */}
              <div className={styles.demoToggleBar}>
                <span className={styles.demoToggleLabel}>Demo Content</span>
                <button
                  className={
                    showDemoContent
                      ? styles.toggleSwitchOn
                      : styles.toggleSwitch
                  }
                  onClick={() => setShowDemoContent(!showDemoContent)}
                  aria-label="Toggle demo content"
                  suppressHydrationWarning
                >
                  <span
                    className={
                      showDemoContent ? styles.toggleKnobOn : styles.toggleKnob
                    }
                  />
                </button>
              </div>
            </>
          )}

          {/* Code View */}
          {activeTab === "code" && (
            <>
              <div className={styles.codeSubTabs}>
                <button
                  className={
                    codeSubTab === "ts"
                      ? styles.codeSubTabActive
                      : styles.codeSubTab
                  }
                  onClick={() => setCodeSubTab("ts")}
                >
                  TypeScript
                  <span className={styles.langBadge}>.TSX</span>
                </button>
                <button
                  className={
                    codeSubTab === "js"
                      ? styles.codeSubTabActive
                      : styles.codeSubTab
                  }
                  onClick={() => setCodeSubTab("js")}
                >
                  JavaScript
                  <span className={styles.langBadge}>.JSX</span>
                </button>
                <button
                  className={
                    codeSubTab === "css"
                      ? styles.codeSubTabActive
                      : styles.codeSubTab
                  }
                  onClick={() => setCodeSubTab("css")}
                >
                  CSS
                  <span className={styles.langBadge}>.CSS</span>
                </button>
                <button
                  className={
                    codeSubTab === "usage"
                      ? styles.codeSubTabActive
                      : styles.codeSubTab
                  }
                  onClick={() => setCodeSubTab("usage")}
                >
                  Usage
                </button>
                <button
                  className={
                    codeSubTab === "cli"
                      ? styles.codeSubTabActive
                      : styles.codeSubTab
                  }
                  onClick={() => setCodeSubTab("cli")}
                >
                  CLI
                  <span className={styles.cliBadge}>↓</span>
                </button>
              </div>

              {codeSubTab === "ts" && (
                <CodeBlock
                  code={displayTsxCode}
                  language="tsx"
                  filename={`${component.name.replace(/\s+/g, "")}.tsx`}
                  enableKeyboardShortcut
                />
              )}
              {codeSubTab === "js" && (
                <CodeBlock
                  code={displayJsxCode}
                  language="jsx"
                  filename={`${component.name.replace(/\s+/g, "")}.jsx`}
                  enableKeyboardShortcut
                />
              )}
              {codeSubTab === "css" && (
                <CodeBlock
                  code={displayCssCode}
                  language="css"
                  filename={`${component.name.replace(/\s+/g, "")}.css`}
                  enableKeyboardShortcut
                />
              )}
              {codeSubTab === "usage" && (
                <CodeBlock
                  code={usageCode}
                  language="tsx"
                  filename="Example.tsx"
                  enableKeyboardShortcut
                />
              )}
              {codeSubTab === "cli" && (
                <CLIPanel
                  slug={slug}
                  shadcnCommand={shadcnCommand}
                  depsCommand={depsCommand}
                  usageCode={usageCode}
                  dependencies={component.dependencies || []}
                />
              )}
            </>
          )}
        </div>

        {/* ====== CUSTOMIZE SECTION ====== */}
        {customizableProps.length > 0 && (
          <div className={styles.customizeSection}>
            <div className={styles.customizeHeader}>
              <h2 className={styles.customizeTitle}>Customize</h2>
              <button onClick={resetProps} className={styles.resetBtn} suppressHydrationWarning>
                <RotateCcw size={11} style={{ marginRight: 4 }} />
                Reset
              </button>
            </div>

            <div className={styles.propsGrid}>
              {customizableProps.map((prop) => {
                const controlType = getControlType(prop.type, prop.default);
                const currentValue =
                  mergedProps[prop.name] ??
                  parseDefaultValue(prop.default, prop.type);
                const defaultVal = parseDefaultValue(prop.default, prop.type);
                const isChanged = customProps[prop.name] !== undefined &&
                  JSON.stringify(customProps[prop.name]) !== JSON.stringify(defaultVal);

                const valueBadgeText = (() => {
                  if (controlType === "color[]" || controlType === "array") {
                    return `[${(currentValue as string[])?.length || 0}]`;
                  }
                  if (controlType === "boolean") {
                    return currentValue ? "true" : "false";
                  }
                  if (controlType === "color") {
                    return String(currentValue || "—");
                  }
                  const str = String(currentValue ?? "—");
                  return str.length > 12 ? str.slice(0, 12) + "…" : str;
                })();

                return (
                  <div key={prop.name} className={styles.propControl}>
                    {isChanged && <span className={styles.changedDot} />}

                    <div className={styles.propControlLabel}>
                      <span className={styles.propControlName}>{prop.name}</span>
                      <div className={styles.propControlRight}>
                        {controlType === "boolean" ? (
                          <span
                            className={
                              currentValue
                                ? styles.boolBadgeTrue
                                : styles.boolBadgeFalse
                            }
                          >
                            {valueBadgeText}
                          </span>
                        ) : (
                          <span className={styles.propControlValue}>
                            {valueBadgeText}
                          </span>
                        )}
                        <button
                          className={styles.propResetBtn}
                          onClick={() => {
                            setCustomProps((prev) => {
                              const next = { ...prev };
                              delete next[prop.name];
                              return next;
                            });
                          }}
                          aria-label={`Reset ${prop.name}`}
                          title={`Reset ${prop.name}`}
                          suppressHydrationWarning
                        >
                          <RotateCcw size={12} />
                        </button>
                      </div>
                    </div>

                    {controlType === "number" && (
                      <div className={styles.sliderRow}>
                        <input
                          type="range"
                          className={styles.slider}
                          value={Number(currentValue) || 0}
                          {...getSliderConfig(
                            parseFloat(prop.default || "0") || 0
                          )}
                          onChange={(e) =>
                            updateProp(prop.name, parseFloat(e.target.value))
                          }
                        />
                        <input
                          type="number"
                          className={styles.numberInput}
                          value={Number(currentValue) || 0}
                          onChange={(e) =>
                            updateProp(prop.name, parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    )}

                    {controlType === "boolean" && (
                      <button
                        className={
                          currentValue
                            ? styles.toggleSwitchOn
                            : styles.toggleSwitch
                        }
                        onClick={() => updateProp(prop.name, !currentValue)}
                        suppressHydrationWarning
                      >
                        <span
                          className={
                            currentValue
                              ? styles.toggleKnobOn
                              : styles.toggleKnob
                          }
                        />
                      </button>
                    )}

                    {controlType === "color" && (
                      <ColorPicker
                        value={String(currentValue || "#ffffff")}
                        onChange={(color) => updateProp(prop.name, color)}
                      />
                    )}

                    {controlType === "color[]" && (
                      <ColorArrayPicker
                        value={
                          Array.isArray(currentValue)
                            ? (currentValue as string[])
                            : ["#ffffff"]
                        }
                        onChange={(colors) => updateProp(prop.name, colors)}
                      />
                    )}

                    {controlType === "text" && (
                      <input
                        type="text"
                        className={styles.textInput}
                        value={String(currentValue || "")}
                        onChange={(e) => updateProp(prop.name, e.target.value)}
                        suppressHydrationWarning
                      />
                    )}

                    {controlType === "select" && (
                      <select
                        className={styles.selectInput}
                        value={String(currentValue || "")}
                        onChange={(e) => updateProp(prop.name, e.target.value)}
                      >
                        {getSelectOptions(prop.type).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {controlType === "array" && (
                      <input
                        type="text"
                        className={styles.textInput}
                        value={
                          Array.isArray(currentValue)
                            ? (currentValue as string[]).join(", ")
                            : String(currentValue || "")
                        }
                        onChange={(e) =>
                          updateProp(
                            prop.name,
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="value1, value2, ..."
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====== PROPS TABLE — Phase 9 ====== */}
        <PropTable
          props={(component.props || []).map((p) => ({
            name: p.name,
            type: p.type,
            default: p.default,
            description: p.description,
            required: p.required,
          }))}
          componentName={component.name}
        />

        {/* Tags */}
        <div className={styles.tagsWrapper}>
          {component.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* ====== SPONSORS SIDEBAR ====== */}
      <aside className={styles.sponsorsSidebar}>
        <div className={styles.sponsorCard}>
          <div className={styles.sponsorTitle}>
            <Heart size={14} className={styles.sponsorTitleIcon} />
            Sponsors
          </div>

          <div className={styles.sponsorSlot}>
            <span className={styles.sponsorSlotText}>Your logo here</span>
            <a href="#" className={styles.sponsorSlotCTA}>
              Become a sponsor →
            </a>
          </div>

          <div className={styles.sponsorSlot}>
            <span className={styles.sponsorSlotText}>Support open source</span>
            <a href="#" className={styles.sponsorSlotCTA}>
              Learn more →
            </a>
          </div>

          <div className={styles.sponsorDivider} />

          <div className={styles.sponsorFooter}>
            LegitUI is free and open source.{" "}
            <a href="#" className={styles.sponsorFooterLink}>
              Sponsor us
            </a>{" "}
            to support development.
          </div>
        </div>
      </aside>
    </div>
  );
}
