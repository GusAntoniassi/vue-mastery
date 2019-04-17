var eventBus = new Vue();

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `<ul>
        <li style="list-style: none" v-for="detail in details">{{ detail }}</li>
    </ul>`
});

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul><li v-for="error in errors">{{ error }}</li></ul>
            </p>

            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" />
            </p>

            <p>
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>

            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>

            <p>
                <input type="submit" value="Submit" />
            </p>
        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: 5,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                };

                eventBus.$emit('review-submitted', productReview);

                this.name = null;
                this.review = null;
                this.rating = null;
            } else {
                this.errors = [];

                if (!this.name) {
                    this.errors.push("Name required");
                }
                if (!this.review) {
                    this.errors.push("Review required");
                }
                if (!this.rating) {
                    this.errors.push("Rating required");
                }
            }
        }
    }
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `<div class="product">
    <div class="product-image">
        <a :href="link">
            <img :src="image" :alt="product" />
        </a>
    </div>
    
    <div class="product-info">
        <h1>{{ title }}</h1>
        <span v-show="onSale" 
            :class="{ strike: !inStock }"
            >On sale!</span>

        <span>{{ dumbChallenge }}</span>

        <p v-if="inventory > 10">In stock</p>
        <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out</p>
        <p v-else>Out of stock</p> 
        <p>Shipping: {{ shipping }}</p>

        <product-details :details="details"></product-details>

        <div v-for="(variant, index) in variants" 
            :key="variant.variantId"
            class="color-box"
            :style="{ backgroundColor: variant.variantColor }"
            @mouseover="updateProduct(index)">
        </div>

        <ul>
            <li v-for="size in sizes">{{ size }}</li>
        </ul>

        <button @click="addToCart" 
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }">Add to Cart</button>
        <button @click="removeFromCart">Remove from Cart</button>
    </div>

    <product-tabs :reviews="reviews"></product-tabs>
</div>`,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            link: '#socks',
            selectedVariant: 0,
            onSale: false,
            inventory: 5,
            details: ['80% cotton', '20% polyester', 'Gender neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: './assets/vmSocks-green.jpg',
                    variantQuantity: 10,
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: './assets/vmSocks-blue.jpg',
                    variantQuantity: 0,
                }
            ],
            sizes: [
                'Small',
                'Large',
                'Extra Large'
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0
        },
        dumbChallenge() {
            return this.onSale ? (this.brand + this.product) : ''
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }

            return 2.99
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        })
    }
});

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
                :class="{ activeTab: selectedTab === tab }" 
                v-for="(tab, index) in tabs" 
                :key="index"
                @click="selectedTab = tab"
                >
                    {{ tab }}
                </span>


        <div v-show="selectedTab === 'Reviews'">
            <h2>Reviews</h2>
            <p v-if="!reviews.length">There are no reviews yet.</p>

            <ul>
                <li v-for="review in reviews">
                    <p>{{ review.name }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>

        <product-review 
            v-show="selectedTab === 'Make a Review'"
        ></product-review>

        </div>

        
    `,
    data() {
        return {
            tabs: [
                'Reviews',
                'Make a Review'
            ],
            selectedTab: 'Reviews'
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            var i = this.cart.indexOf(id);
            if (i !== -1) {
                this.cart.splice(i, 1);
            }
        }
    }
});