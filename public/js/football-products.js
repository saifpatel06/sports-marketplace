async function main() {
    try {
        const response = await fetch("/api/products?category=football");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        const productContainer = document.getElementById("products-container");

        if (!productContainer) {
            throw new Error("Products container element not found");
        }

        products.forEach((product) => {
            try {
                const productElement = document.createElement("div");
                const productHTML = `
                    <a href="product.html?productId=${product.id}&category=football">
                        <img src="${product.imagePath}">
                    </a>
                    <h4>${product.name}</h4>
                    <div class="rating">
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star-o"></i>
                    </div>
                    <p>RS ${product.price}</p>
                `;
                productElement.classList.add("col-4");
                productElement.innerHTML = productHTML;
                productContainer.appendChild(productElement);
            } catch (error) {
                console.error("Error creating product element:", error);
            }
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        const productContainer = document.getElementById("products-container");
        if (productContainer) {
            productContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    }
}

main();