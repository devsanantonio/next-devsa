import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  // design/ holds standalone render scripts for social graphics, not site code
  { ignores: ["design/**"] },
];

export default eslintConfig;
