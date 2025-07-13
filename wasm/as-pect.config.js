export default {
  /**
   * A set of globs passed to the glob package that qualify assembly files for testing.
   */
  include: ["assembly/__tests__/**/*.spec.ts", "assembly/__tests__/**/*.test.ts"],
  /**
   * A set of globs passed to the glob package that quality files to be added to each test.
   */
  add: ["assembly/__tests__/setup.ts"],
  /**
   * All the compiler flags needed for this test suite. Make sure that a binary file is output.
   */
  flags: {
    /** To output a wat file, uncomment the following line. */
    // "--textFile": ["output.wat"],
    /** A runtime must be exported for as-pect to use. */
    "--exportRuntime": [],
    /** The filename for the wasm file output. */
    "--outFile": ["output.wasm"],
    /** Optimize with --optimize */
    "--optimize": [],
    /** Use the debug flag to include debug information in the binary */
    "--debug": [],
    /** Additional flags can be added here. */
  },
  /**
   * Add your required AssemblyScript imports here.
   */
  imports: {},
  /**
   * All performance statistics reporting can be configured here.
   */
  performance: {
    /** Enable performance statistics gathering for this test suite. */
    enabled: false,
  },
  /**
   * Add a custom reporter here if you want one. The following example is in typescript.
   *
   * @example
   * import { TestReporter, TestSuite, TestGroup, TestResult, TestContext } from "as-pect";
   *
   * export class CustomReporter extends TestReporter {
   *   // reporting implementation details
   * }
   */
  // reporter: new CustomReporter(),
  /**
   * Specify if the binary file should be written to the file system.
   */
  outputBinary: false,
}