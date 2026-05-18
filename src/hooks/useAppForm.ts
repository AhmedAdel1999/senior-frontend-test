import {
  useForm,
  type UseFormReturn,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";
import type { FieldValues } from "react-hook-form";

export function useAppForm<T extends FieldValues>(
  schema: ZodSchema<T>,
  defaultValues: DefaultValues<T>,
): UseFormReturn<T> {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
}
