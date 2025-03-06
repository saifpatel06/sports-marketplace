async function fetchProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

async function fetchProductRecommendations(productCategory) {
    try {
        const response = await fetch(`/api/products?category=${productCategory}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const shuffled = data?.sort(() => 0.5 - Math.random());
        return shuffled?.slice(0, 3);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

async function main() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');
        const productCategory = urlParams.get("category")

        if (!productId || !productCategory) {
            window.location.href = '/';
        }

        const [productData, recommendations] = await Promise.all([
            fetchProduct(productId),
            fetchProductRecommendations(productCategory)
        ])

        if (!productData) {
            throw new Error('Failed to fetch product data');
        }

        console.log({
            productData,
            recommendations
        })

        const individualProductContainer = document.getElementById("individual-product");
        const productHTML = `
            <div class="row">
                <div class="col-2">
                    <a href="football kit black.html">
                        <img src="${productData.imagePath}" width="80%">
                    </a>
                </div>

                <div class="col-2">
                    <h1>${productData.name}</h1>
                    <h4>₹.${productData.price}</h4>
                    
                    ${productData.sizes?.length > 0 ? `
                        <select id="size-select" value=${productData.sizes[0]}>
                            <option>SELECT SIZE</option>
                            ${productData.sizes.map(size => `<option>${size}</option>`).join('')}
                        </select>
                    ` : ''}
                    
                    <input min="1" type="number" value="1" id="quantity">
                    
                    <a class="btn" id="add-to-cart">Add To Cart</a>
                    
                    <div class="rating">
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star-o"></i>
                    </div>
                    
                    <br>
                    <h3>PRODUCT DETAILS <i class="fa fa-indent"></i></h3>
                    <br>
                    ${productData.description.map(description => `<p>${description}</p>`).join('')}
                    
                    <h3>About this item</h3>
                    <p>${productData.about}</p>
                </div>
            </div>
        `;

        individualProductContainer.innerHTML = productHTML;

        const relatedProductsContainer = document.getElementById("related-products");
        const relatedProductsHTML = `
            ${recommendations.map(recommendation => `
                <div class="col-4">
                    <a href="product.html?productId=${recommendation.id}&category=${recommendation.category}">
                        <img src="${recommendation.imagePath}">
                    </a>
                    <h4>${recommendation.name}</h4>
                    <div class="rating">
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star"></i>
                        <i class="fa fa-star-o"></i>
                    </div>
                    <p>RS ${recommendation.price}</p>
                </div>
            `).join('')}
        `;

        relatedProductsContainer.innerHTML = relatedProductsHTML;
        addEventListeners();
    } catch (error) {
        console.error(error)
    }
}

function addEventListeners() {
    const addToCartButton = document.getElementById("add-to-cart");
    addToCartButton.addEventListener("click", () => {
        addToCart();
    });
}

async function addToCart() {
    try {

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');
        const userId = localStorage.getItem('userId');
        const size = document.getElementById('size-select')?.value;
        const quantity = document.getElementById('quantity')?.value;

        console.log({
            userId,
            productId,
            quantity,
            size
        })

        const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, productId, quantity, size })
        })

        if (response.ok) {
            alert("Product added to cart successfully");
        } else {
            alert("Failed to add product to cart");
        }
    } catch (error) {
        console.error("Error adding product to cart:", error);
    }
}
main()