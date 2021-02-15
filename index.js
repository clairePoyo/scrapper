const puppeteer = require('puppeteer');

const getLongestReview = (reviews) => {
	let longestReview = reviews[0]
	reviews.forEach((review) => {
		if (review.length > longestReview.length) {
			longestReview = review
		}
	})
	return longestReview
}


async function getProductsReview(links) {
	if (!links || links.length === 0) return
	const promises = links.map((link) => getAmazonReviews(link))
	Promise.all(promises)
	.then((productReviews) => productReviews)
}


async function getAmazonReviews(url) {
	// const url = 'https://www.amazon.fr/Pok%C3%A9mon-Figures-Pokemon-Figurines-Celebration/dp/B07Z4RJZNJ/ref=sr_1_14?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=pokemon&qid=1613328218&sr=8-14&th=1'

	const browser = await puppeteer.launch();
  	const page = await browser.newPage();

	await page.goto(url);

	const {title, description, badReviewsLink, goodReviewsLink} = await page.evaluate(() => {
		const goodReviewsLink = Array.from(document.querySelectorAll('#histogramTable > tbody > tr:nth-child(1) > td.aok-nowrap > span.a-size-base > a'), element => element.href)[0]
		const badReviewsLink = Array.from(document.querySelectorAll('#histogramTable > tbody > tr:nth-child(5) > td.aok-nowrap > span.a-size-base > a'), element => element.href)[0]

		return {
			title: document.getElementById('productTitle').innerText,
			description: document.querySelector('#productDescription > p').innerText,
			goodReviewsLink,
			badReviewsLink
		}
	})

	const getReviews = async (reviewsLink) => {
		await page.goto(reviewsLink);
		const catchReviews = await page.evaluate(() => {
			const reviews = Array.from(document.querySelectorAll('span[data-hook="review-body"] > span'));
			return reviews.map((review) => review.innerText)
		})
		return catchReviews
	}

	const goodReviews = await getReviews(goodReviewsLink)
	const badReviews = await getReviews(badReviewsLink)

	browser.close();
	console.log("DONE")
	console.log({
		goodReview: getLongestReview(goodReviews), 
		badReview: getLongestReview(badReviews), 
		title, description
	})

	return {
		goodReview: getLongestReview(goodReviews), 
		badReview: getLongestReview(badReviews), 
		title, description
	}
	
}


getProductReviews()
