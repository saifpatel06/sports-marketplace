let isConfirmed = false;

async function main() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication required. Please log in.");
            return;
        }

        const response = await fetch(`/api/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error("HTTP error! status:", response.status);
            return;
        }

        const cartItems = await response.json();
        renderCart(cartItems);
    } catch (error) {
        console.error("Error fetching cart items:", error);
    }
}

function renderCart(cartItems) {
    const cartContainer = document.getElementById("cart-items");
    
    if (!cartContainer) {
        console.error("Cart container element not found");
        return;
    }

    cartContainer.innerHTML = "";
    
    let tableContent = `
        <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
        </tr>
    `;
    
    let totalPrice = 0;

    if (!cartItems || cartItems.length === 0) {
        tableContent += `<tr><td colspan='5'>Your cart is empty</td></tr>`;
    } else {
        cartItems.forEach((item) => {
            const subtotal = item.product.price * item.quantity;
            totalPrice += subtotal;

            tableContent += `
                <tr data-id="${item.id}">
                    <td>
                        <div class="cart-info">
                            <img 
                                src="${item.product.imagePath}"
                                height="100px"
                                width="100px"
                            />
                            <div>
                                <p>${item.product.name}</p>
                                <small>Price: ₹${item.product.price}</small><br />
                                <a href="#" class="btn remove-btn" data-id="${item.id}" ${isConfirmed ? 'style="display:none;"' : ''}>REMOVE</a>
                            </div>
                        </div>
                    </td>
                    <td>${item.size}</td>
                    <td>
                        <input 
                            type="number" 
                            style="width: 50px;" 
                            value="${item.quantity}" 
                            min="1"
                            class="quantity-input"
                            data-id="${item.id}"
                            data-price="${item.product.price}"
                            ${isConfirmed ? 'disabled' : ''}
                        />
                    </td>
                    <td>₹${item.product.price}</td>
                    <td class="subtotal" data-id="${item.id}">₹${subtotal.toFixed(2)}</td>
                </tr>
            `;
        });
    }

    let gst = totalPrice * 0.18;
    let finalTotal = totalPrice + gst;

    tableContent += `
        <tr>
            <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
            <td>₹${totalPrice.toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="4" style="text-align: right;"><strong>GST (18%):</strong></td>
            <td>₹${gst.toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="4" style="text-align: right;"><strong>Final Total:</strong></td>
            <td><strong>₹${finalTotal.toFixed(2)}</strong></td>
        </tr>
    `;
    
    cartContainer.innerHTML = tableContent;
    
    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", async function(event) {
            event.preventDefault();
            await removeFromCart(this.getAttribute("data-id"));
        });
    });

    document.querySelectorAll(".quantity-input").forEach(input => {
        input.addEventListener("change", function() {
            updateCart(this.getAttribute("data-id"), this.value, this.getAttribute("data-price"));
        });
    });
}

async function removeFromCart(itemId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found. Please log in.");

        const response = await fetch(`/api/cart/${itemId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`Failed to remove item. Status: ${response.status}`);

        document.querySelector(`tr[data-id='${itemId}']`).remove();
        main();
    } catch (error) {
        console.error("Error removing item:", error);
    }
}

async function updateCart(itemId, quantity, price) {
    const newSubtotal = quantity * price;
    document.querySelector(`.subtotal[data-id='${itemId}']`).textContent = `₹${newSubtotal.toFixed(2)}`;
    main();
}

main();
