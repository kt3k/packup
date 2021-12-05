/** Compiles the given string into css.
 *
 * TODO(kt3k): Support importer
 */
export async function compile(text: string): Promise<string> {
  // Use dynamic import because sass.js is slow to import
  const start = performance.now();
  console.log("Importing sass");
  const { Sass } = await import("./vendor/" + "sass/mod.ts");
  console.log(`Imported sass in ${(performance.now() - start).toFixed(1)}ms`);
  return new Promise((resolve, reject) => {
    // deno-lint-ignore no-explicit-any
    Sass.compile(text, (result: any) => {
      if (result.status === 0) {
        resolve(result.text);
      } else {
        reject(new Error(result.message));
      }
    });
  });
}
