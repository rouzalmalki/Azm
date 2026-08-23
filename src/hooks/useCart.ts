/**
 * useCart — manages shopping cart state persisted in localStorage
 */
import { useCallback } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Template } from "@/types";

export interface CartItem {
  templateId: string;
  templateTitle: string;
  templateCategory: string;
  price: number; // SAR
  addedAt: string;
}

const PRICE_PER_TEMPLATE = 10; // SAR

export interface UseCartResult {
  items: CartItem[];
  total: number;
  count: number;
  addItem: (template: Template) => void;
  removeItem: (templateId: string) => void;
  clearCart: () => void;
  isInCart: (templateId: string) => boolean;
}

export function useCart(): UseCartResult {
  const [items, setItems] = useLocalStorage<CartItem[]>("azm_cart", []);

  const addItem = useCallback(
    (template: Template) => {
      if (items.some((i) => i.templateId === template.id)) {
        toast.info("النموذج موجود بالفعل في السلة", {
          description: template.title,
          action: {
            label: "عرض السلة",
            onClick: () => window.dispatchEvent(new CustomEvent("azm:open-cart")),
          },
          duration: 3000,
        });
        return;
      }
      setItems([
        ...items,
        {
          templateId: template.id,
          templateTitle: template.title,
          templateCategory: template.category.replace(/_/g, " "),
          price: PRICE_PER_TEMPLATE,
          addedAt: new Date().toISOString(),
        },
      ]);
      toast.success("تمت الإضافة إلى السلة", {
        description: template.title,
        action: {
          label: "عرض السلة",
          onClick: () => window.dispatchEvent(new CustomEvent("azm:open-cart")),
        },
        duration: 4000,
      });
    },
    [items, setItems]
  );

  const removeItem = useCallback(
    (templateId: string) => {
      setItems(items.filter((i) => i.templateId !== templateId));
    },
    [items, setItems]
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const isInCart = useCallback(
    (templateId: string) => items.some((i) => i.templateId === templateId),
    [items]
  );

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return { items, total, count: items.length, addItem, removeItem, clearCart, isInCart };
}
