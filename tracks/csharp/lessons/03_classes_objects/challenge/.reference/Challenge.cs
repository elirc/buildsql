// 03_classes_objects / challenge - a class that owns a collection.
// See lessons/03_classes_objects/README.md, "Challenge".

namespace CSharpDojo.L03_ClassesObjects;

public class CartItem
{
    public CartItem(string name, decimal unitPrice, int quantity)
    {
        Name = name;
        UnitPrice = unitPrice;
        Quantity = quantity;
    }

    public string Name { get; }

    public decimal UnitPrice { get; }

    /// <summary>Only the cart that owns this item may change how many there are.</summary>
    public int Quantity { get; internal set; }

    public decimal LineTotal => UnitPrice * Quantity;
}

public class ShoppingCart
{
    private readonly List<CartItem> _items = new List<CartItem>();

    /// <summary>
    /// The items, in the order they were first added - and in a form the caller
    /// cannot cast back to List&lt;CartItem&gt; and mutate.
    /// </summary>
    public IReadOnlyList<CartItem> Items => _items.AsReadOnly();

    /// <summary>Every unit in the cart, not the number of distinct lines.</summary>
    public int ItemCount
    {
        get
        {
            int total = 0;
            foreach (CartItem item in _items)
            {
                total += item.Quantity;
            }

            return total;
        }
    }

    public decimal Total
    {
        get
        {
            decimal total = 0m;
            foreach (CartItem item in _items)
            {
                total += item.LineTotal;
            }

            return total;
        }
    }

    /// <summary>
    /// Add units. A name already in the cart gains quantity instead of
    /// appearing twice. A quantity of zero or less is an
    /// ArgumentOutOfRangeException.
    /// </summary>
    public void Add(string name, decimal unitPrice, int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), quantity, "Add at least one unit.");
        }

        foreach (CartItem item in _items)
        {
            if (item.Name == name)
            {
                item.Quantity += quantity;
                return;
            }
        }

        _items.Add(new CartItem(name, unitPrice, quantity));
    }

    /// <summary>Drop a line entirely. Returns false if it was never there.</summary>
    public bool Remove(string name)
    {
        for (int i = 0; i < _items.Count; i++)
        {
            if (_items[i].Name == name)
            {
                _items.RemoveAt(i);
                return true;
            }
        }

        return false;
    }
}
