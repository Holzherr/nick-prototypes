/**
 * The shapes Spot the Shape uses. Naming shapes is the way into counting sides, so every straight-sided
 * shape carries its side count and the game can ask either question from the same set.
 */
export type ShapeId = 'circle' | 'oval' | 'triangle' | 'square' | 'rectangle' | 'rhombus' | 'pentagon' | 'hexagon' | 'octagon' | 'star';

export interface Shape {
  id: ShapeId;
  /** What a four-year-old should call it: a rhombus is a diamond until much later. */
  name: string;
  /** Straight sides. Zero for the round ones, which is why they are never the answer to "how many sides?". */
  sides: number;
  /** So the voice says "a hexagon" but "an octagon". */
  article: 'a' | 'an';
}

export const SHAPES: Record<ShapeId, Shape> = {
  circle: { id: 'circle', name: 'circle', sides: 0, article: 'a' },
  oval: { id: 'oval', name: 'oval', sides: 0, article: 'an' },
  triangle: { id: 'triangle', name: 'triangle', sides: 3, article: 'a' },
  square: { id: 'square', name: 'square', sides: 4, article: 'a' },
  rectangle: { id: 'rectangle', name: 'rectangle', sides: 4, article: 'a' },
  rhombus: { id: 'rhombus', name: 'diamond', sides: 4, article: 'a' },
  pentagon: { id: 'pentagon', name: 'pentagon', sides: 5, article: 'a' },
  hexagon: { id: 'hexagon', name: 'hexagon', sides: 6, article: 'a' },
  octagon: { id: 'octagon', name: 'octagon', sides: 8, article: 'an' },
  star: { id: 'star', name: 'star', sides: 10, article: 'a' },
};

export const SHAPE_IDS = Object.keys(SHAPES) as readonly ShapeId[];

export const shapeName = (id: ShapeId) => SHAPES[id].name;

/** "a hexagon", "an octagon". */
export const shapeWithArticle = (id: ShapeId) => `${SHAPES[id].article} ${SHAPES[id].name}`;

/** Corners of a regular polygon on the unit circle, first corner at angle 0. Orientation is the caller's. */
export function polygonPoints(sides: number, radius = 1): string {
  return Array.from({ length: sides }, (_, i) => {
    const angle = ((360 / sides) * i * Math.PI) / 180;
    return `${(radius * Math.cos(angle)).toFixed(4)},${(radius * Math.sin(angle)).toFixed(4)}`;
  }).join(' ');
}

/** A five-pointed star: outer and inner corners alternating, first corner at angle 0. */
export function starPoints(points = 5, outer = 1, inner = 0.42): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const radius = i % 2 ? inner : outer;
    const angle = ((180 / points) * i * Math.PI) / 180;
    return `${(radius * Math.cos(angle)).toFixed(4)},${(radius * Math.sin(angle)).toFixed(4)}`;
  }).join(' ');
}
