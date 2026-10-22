import { Request, Response } from 'express';

const menuItems = [
  {
    id: 'burger', category: 'BURGERS', image: '/images/burger.jpg',
    name: "D'LICIOUS Classic Burger",
    description: 'Double smash patty, cheddar, pickles, house sauce, brioche bun.',
    price: 80.90,
    availableExtras: [
      { id: 'bacon',        name: 'Bacon',        price: 15.00 },
      { id: 'extra-cheese', name: 'Extra Cheese',  price: 10.00 },
      { id: 'fried-egg',    name: 'Fried Egg',     price: 8.00  },
      { id: 'jalapenos',    name: 'Jalapeños',     price: 6.00  },
      { id: 'avocado',      name: 'Avocado',       price: 12.00 },
    ],
  },
  {
    id: 'chicken', category: 'CHICKEN', image: '/images/chicken.webp',
    name: 'Firehouse Chicken',
    description: 'Crispy chicken, fries, chili mayo, fresh herbs, and garden slaw.',
    price: 85.50,
    availableExtras: [
      { id: 'extra-sauce', name: 'Extra Chili Mayo', price: 5.00  },
      { id: 'cheese',      name: 'Cheese Slice',     price: 10.00 },
      { id: 'coleslaw',    name: 'Extra Coleslaw',   price: 8.00  },
      { id: 'onion-rings', name: 'Onion Rings',      price: 18.00 },
    ],
  },
  {
    id: 'pizza', category: 'PIZZA', image: '/images/pizza-1.jpg',
    name: "Chef's Margherita Pizza",
    description: 'Wood-fired tomato sauce, mozzarella, basil, and olive oil.',
    price: 120.20,
    availableExtras: [
      { id: 'extra-mozzarella', name: 'Extra Mozzarella', price: 15.00 },
      { id: 'olives',           name: 'Black Olives',      price: 8.00  },
      { id: 'mushrooms',        name: 'Mushrooms',         price: 10.00 },
      { id: 'pepperoni',        name: 'Pepperoni',         price: 20.00 },
      { id: 'chili-flakes',     name: 'Chili Flakes',      price: 4.00  },
    ],
  },
  {
    id: 'wrap', category: 'WRAPS', image: '/images/wrap.webp',
    name: 'Chicken Wrap',
    description: 'Grilled chicken, peppers, lettuce, ranch, and toasted tortilla.',
    price: 70.75,
    availableExtras: [
      { id: 'extra-ranch', name: 'Extra Ranch',  price: 5.00  },
      { id: 'bacon-wrap',  name: 'Bacon Strips', price: 15.00 },
      { id: 'avo-wrap',    name: 'Avocado',      price: 12.00 },
      { id: 'cheese-wrap', name: 'Cheese',       price: 10.00 },
    ],
  },
  {
    id: 'pasta', category: 'PASTA', image: '/images/pasta.jpg',
    name: 'Truffle Pasta',
    description: 'Fresh pasta ribbons, parmesan, mushrooms, herbs, and cream sauce.',
    price: 135.40,
    availableExtras: [
      { id: 'extra-parmesan',  name: 'Extra Parmesan',  price: 10.00 },
      { id: 'grilled-chicken', name: 'Grilled Chicken', price: 25.00 },
      { id: 'extra-truffle',   name: 'Truffle Oil',     price: 20.00 },
      { id: 'spinach',         name: 'Wilted Spinach',  price: 8.00  },
    ],
  },
  {
    id: 'cupcake', category: 'DESSERTS', image: '/images/cupcake.jpg',
    name: 'Sweet Finish Cupcake',
    description: 'Soft vanilla sponge, cream frosting, chocolate drizzle.',
    price: 45.20,
    availableExtras: [
      { id: 'extra-frosting', name: 'Extra Frosting',    price: 6.00 },
      { id: 'sprinkles',      name: 'Rainbow Sprinkles', price: 3.00 },
      { id: 'choc-sauce',     name: 'Chocolate Sauce',   price: 5.00 },
      { id: 'strawberry',     name: 'Fresh Strawberry',  price: 8.00 },
    ],
  },
];

// GET /api/menu
export function getMenu(_req: Request, res: Response): void {
  res.json({ data: menuItems });
}

// GET /api/menu/:id
export function getMenuItem(req: Request, res: Response): void {
  const item = menuItems.find(m => m.id === req.params['id']);
  if (!item) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  res.json({ data: item });
}
