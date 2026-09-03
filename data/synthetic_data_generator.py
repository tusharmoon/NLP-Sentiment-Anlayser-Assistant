import pandas as pd
import random
from faker import Faker

fake = Faker()

# Configuration
TOTAL_ROWS = 10000

products = [
    "Smartphone X Pro", "Ultra Wireless Headphones", "FitTrack Smartwatch", 
    "Ergonomic Office Chair", "Mechanical Gaming Keyboard", "4K Ultra HD Monitor", 
    "Noise Canceling Earbuds", "Portable Power Bank 20000mAh", "HD Webcam 1080p", 
    "Compact Bluetooth Speaker"
]

# Phrase banks to build realistic reviews matching sentiment ratings
reviews_5_star = [
    "Absolutely love this product! The build quality is top-notch.",
    "Best purchase I have made all year. Highly recommended to everyone.",
    "Exceeded my expectations. The setup was effortless and it works flawlessly.",
    "Fantastic performance and beautiful design. Delivery was super fast as well.",
    "Great value for money. Would definitely buy again!"
]

reviews_4_star = [
    "Really good quality overall. Slightly expensive, but worth it.",
    "Works great and meets all my needs. Minor issues with initial setup.",
    "Solid performance. Battery life could be slightly better, but overall happy.",
    "Good value for money. The design looks sleek and modern.",
    "Satisfied with the purchase. Shipping took a couple of extra days."
]

reviews_3_star = [
    "It is decent, but nothing extraordinary. Does the job.",
    "Average quality for the price point. Could use a few improvements.",
    "It works fine, but I expected better customer service support.",
    "Mixed feelings about this. Some features work well while others are laggy.",
    "Acceptable performance, but the packaging arrived slightly damaged."
]

reviews_2_star = [
    "Below expectations. The product feels cheap and started lagging after a week.",
    "Not very impressed. Battery drains much faster than advertised.",
    "Disappointed with the overall quality. Instructions were very unclear.",
    "The build material feels cheap and customer support was unresponsive.",
    "Had higher hopes. It stopped working properly after three weeks."
]

reviews_1_star = [
    "Terrible product! Stopped working on day two. Requesting a full refund.",
    "Complete waste of money. Do not buy this item under any circumstances.",
    "Horrible experience. Package arrived damaged and customer support ignored me.",
    "Defective unit. Extremely frustrated with the slow shipping and broken features.",
    "Worst purchase ever. Product broke almost immediately out of the box."
]

data = []

print(f"Generating {TOTAL_ROWS} rows of sample review data...")

for i in range(1, TOTAL_ROWS + 1):
    review_id = f"REV-{i:05d}"
    customer = fake.first_name()
    product = random.choice(products)
    
    # Weighted rating distribution (60% positive, 20% neutral, 20% negative)
    rating = random.choices([5, 4, 3, 2, 1], weights=[40, 20, 20, 10, 10])[0]
    
    if rating == 5:
        review_text = random.choice(reviews_5_star)
    elif rating == 4:
        review_text = random.choice(reviews_4_star)
    elif rating == 3:
        review_text = random.choice(reviews_3_star)
    elif rating == 2:
        review_text = random.choice(reviews_2_star)
    else:
        review_text = random.choice(reviews_1_star)
        
    data.append({
        "review_id": review_id,
        "customer": customer,
        "product": product,
        "rating": rating,
        "review": review_text
    })

df = pd.DataFrame(data)
output_filename = "marketing_reviews_10k.csv"
df.to_csv(output_filename, index=False)

print(f"Dataset successfully created and saved as '{output_filename}'!")

