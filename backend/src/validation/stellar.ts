import { z } from "zod";

/**
 * Stellar address validator.
 * Requirements:
 * - Must be exactly 56 characters long
 * - Must start with the letter "G"
 */
const stellarAddressSchema = z
  .string()
  .length(56, { message: "Stellar address must be exactly 56 characters long" })
  .regex(/^G.*/, {
    message: "Stellar address must start with 'G'",
  });

export default stellarAddressSchema;
