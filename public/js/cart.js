async function main() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cartItems = await response.json();

        const cartContainer = document.getElementById("cart-items");
        if (!cartContainer) {
            throw new Error("Cart container element not found");
        }

        cartItems.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <div class="cart-info">
                        <img 
                            src="${item.product.imagePath}"
                            height="300px"
                            width="300px"
                        />
                        <div>
                            <p>${item.product.name}</p>
                            <br />
                            <small>price: ₹${item.product.price}</small><br />
                            <a href="#" onclick="removeFromCart('${item.id}')">REMOVE</a>
                        </div>
                    </div>
                </td>
                <td>
                    ${item.size}
                </td>
                <td>
                    <input
                        type="number"
                        style="width: 50px;"
                        value="${item.quantity}"
                    />
                </td>
                <td>₹${item.product.price * item.quantity}</td>
            `;
            cartContainer.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching cart items:", error);
    }
}

main();
