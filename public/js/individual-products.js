async function main () {

}
async function main(){
    const data = await fetch("/api/products?/:id")
    const products = await data.json()
console.log(products,"Products")
    const productContainer  = document.getElementById("products-container");
    products.forEach((product) => {
        const productElement = document.createElement("div");
        const productHTML = `
            <a href="football-product.html?productId=${product.id}">
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
            `
        productElement.classList.add(["col-4"]);
        productElement.innerHTML = productHTML
        productContainer.appendChild(productElement);
    })
}


main()