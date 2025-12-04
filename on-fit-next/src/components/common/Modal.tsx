'use client'
import { ComponentPropsWithRef, ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./Card";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps extends ComponentPropsWithRef<'div'> {
    open: boolean
    onClose: () => void
    children?: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
    closeOnBackdrop?: boolean
}

export function Modal({
    open,
    onClose,
    children,
    size = 'md',
    closeOnBackdrop = false,
    className,
    ...props
}: ModalProps) {
      const [mounted, setMounted] = useState(false)

      useEffect(() => {
        setMounted(true)
      }, [])

     const sizeClasses = {
  sm: 'max-w-sm max-h-[80vh]',
  md: 'max-w-md max-h-[80vh]',
  lg: 'max-w-lg max-h-[80vh]',
  xl: 'max-w-xl max-h-[80vh]',
  '2xl': 'max-w-2xl max-h-[80vh]',
  '3xl': 'max-w-3xl max-h-[80vh]',
  full: 'max-w-full mx-4 max-h-[100vh]',
}


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  if(!mounted || !open) return null;

  const modalContent = (
    <>
    {/* Backdrop */}
    <div className="fixed inset-0 z-99 bg-background/80 backdrop-blur-sm"
    onClick={handleBackdropClick}>
    </div>

    <div
    className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none"
    role="dialog"
    aria-modal="true">

         {/* Modal Content */}
    <Card
    className={cn(
        'relative w-full mx-4 my-8 pointer-events-auto',
        sizeClasses[size],
        className
    )}
    {...props}>
    {children}

    </Card>

    </div>


    </>
  )
  
    return createPortal(modalContent, document.body)
        
}

export {CardHeader as ModalHeader}
export {CardContent as ModalContent}
export { CardFooter as ModalFooter }