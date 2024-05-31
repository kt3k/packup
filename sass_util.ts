/** Compiles the given string into css.
 *
 * TODO(kt3k): Support importer
 */
export async function compile(text: string): Promise<string> {
  // Use dynamic import because sass.js is slow to import
  const start = performance.now();
  console.log("Importing sass");
  const sass = await import("npm:sass@1.77.2");
  console.log(`Imported sass in ${(performance.now() - start).toFixed(1)}ms`);
  const result = await sass.compileStringAsync(text);
  return result.css;
}
