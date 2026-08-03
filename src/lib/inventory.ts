/**
 * Inventory model for the community store.
 *
 * Availability is always *reported* by the store, never reserved by the app.
 * Nothing here implies a purchase, reservation or confirmed order.
 */

export type InventoryType = 'unique' | 'limited' | 'made_to_order' | 'available';

export const INVENTORY_TYPES: InventoryType[] = [
  'unique',
  'limited',
  'made_to_order',
  'available',
];

export const AVAILABILITY_DISCLAIMER = 'Disponibilidade sujeita à confirmação.';

export interface InventoryInput {
  inventoryType: InventoryType;
  stockQuantity?: number;
  productionTime?: string;
}

export interface InventoryStatus {
  type: InventoryType;
  /** Max units a customer may put in the cart. undefined = no precise limit. */
  maxQuantity?: number;
  /** Reported stock, when the type tracks it. */
  stockQuantity?: number;
  productionTime?: string;
  isSoldOut: boolean;
  /** Unique pieces may appear in the cart only once. */
  singleUnitOnly: boolean;
  badge: string;
  badgeTone: 'unique' | 'warning' | 'info' | 'neutral' | 'soldout';
  /** Longer, human-readable availability sentence. */
  message: string;
}

const madeToOrderMessage = (productionTime?: string) =>
  productionTime
    ? `Produzido após a solicitação. Prazo estimado: ${productionTime}.`
    : 'Produzido após a solicitação. Prazo estimado informado pela loja.';

export function getInventoryStatus(input: InventoryInput): InventoryStatus {
  const { inventoryType, stockQuantity, productionTime } = input;

  switch (inventoryType) {
    case 'unique': {
      const stock = stockQuantity ?? 0;
      if (stock <= 0) {
        return {
          type: 'unique',
          maxQuantity: 0,
          stockQuantity: 0,
          isSoldOut: true,
          singleUnitOnly: true,
          badge: 'Esgotado',
          badgeTone: 'soldout',
          message: 'Peça única já vendida ou indisponível.',
        };
      }
      return {
        type: 'unique',
        maxQuantity: 1,
        stockQuantity: 1,
        isSoldOut: false,
        singleUnitOnly: true,
        badge: 'Peça única',
        badgeTone: 'unique',
        message: 'Peça única — apenas uma unidade reportada pela loja.',
      };
    }

    case 'limited': {
      const stock = Number.isFinite(stockQuantity as number)
        ? Math.max(0, Math.floor(stockQuantity as number))
        : 0;
      if (stock <= 0) {
        return {
          type: 'limited',
          maxQuantity: 0,
          stockQuantity: 0,
          isSoldOut: true,
          singleUnitOnly: false,
          badge: 'Esgotado',
          badgeTone: 'soldout',
          message: 'Sem unidades reportadas no momento.',
        };
      }
      return {
        type: 'limited',
        maxQuantity: stock,
        stockQuantity: stock,
        isSoldOut: false,
        singleUnitOnly: false,
        badge: stock === 1 ? 'Última unidade' : 'Poucas unidades',
        badgeTone: 'warning',
        message:
          stock === 1
            ? 'Última unidade reportada pela loja.'
            : `${stock} unidades reportadas pela loja.`,
      };
    }

    case 'made_to_order':
      return {
        type: 'made_to_order',
        maxQuantity: undefined,
        productionTime,
        isSoldOut: false,
        singleUnitOnly: false,
        badge: 'Feito sob encomenda',
        badgeTone: 'info',
        message: madeToOrderMessage(productionTime),
      };

    case 'available':
    default:
      return {
        type: 'available',
        maxQuantity: undefined,
        isSoldOut: false,
        singleUnitOnly: false,
        badge: 'Disponível',
        badgeTone: 'neutral',
        message: 'Geralmente disponível, sem contagem exata de estoque.',
      };
  }
}

export const badgeToneClasses: Record<InventoryStatus['badgeTone'], string> = {
  unique: 'bg-amber-400 text-white',
  warning: 'bg-terra-600 text-white',
  info: 'bg-forest-700 text-white',
  neutral: 'bg-sand-200 text-forest-800',
  soldout: 'bg-forest-900/70 text-white',
};
