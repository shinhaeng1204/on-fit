import * as React from "react";

import { cn } from "@/lib/utils";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
  radioClassName?: string
  textClassName?: string
  text: React.ReactNode
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ containerClassName,radioClassName, textClassName,name, text ,id, type, ...props }, ref) => {
    return (
      <div className={cn("flex items-center space-x-2", containerClassName,)}>
        <input
          type="radio"
          className={
          cn("flex items-center justify-center h-4 w-4 appearance-none rounded-full border border-primary outline-none cursor-pointer",
            "checked:before:content-[''] checked:before:w-2.5 checked:before:h-2.5 checked:before:rounded-full checked:before:bg-primary",
            radioClassName,
          )}
          id={id}
          name={name}
          ref={ref}
          {...props}
        />
        <label
          htmlFor={id}
          className={
          cn("text-sm font-normal cursor-pointer leading-none " +
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ",
            textClassName)}>
          {text}
        </label>
      </div>
    );
  },
);
Radio.displayName = "Radio";

export { Radio };