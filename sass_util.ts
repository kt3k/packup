
/** Compiles the given string into css.
 *
 * TODO(kt3k): Support importer
 */
export async function compile(text: string): Promise<string> {
  // Use dynamic import because sass.js is slow to import
  // Also
  const { Sass } = await import ("./vendor/sass/mod.ts");
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
