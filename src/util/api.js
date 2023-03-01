export const getParkList = (circleCoords) => {
    return fetch(`https://api.geoapify.com/v2/places?categories=national_park,entertainment.theme_park,entertainment.water_park,entertainment.activity_park,leisure.park&filter=circle:${circleCoords}&limit=20&apiKey=1b48259b810e48ddb151889f9ea58db0`).then(res => res.json());
}