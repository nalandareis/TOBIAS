// Junta as avaliações de exemplo com as feitas neste navegador.
export function reviewsOf(target, kind, storedReviews) {
  const own = storedReviews
    .filter((review) => review.kind === kind && review.targetId === target.id)
    .map((review) => ({
      author: review.authorName,
      rating: review.rating,
      comment: review.comment,
      date: review.at.slice(0, 10),
    }))
  return [...own, ...target.reviews]
}

export function ratingSummary(reviews) {
  if (!reviews.length) return { average: 0, count: 0 }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return { average: total / reviews.length, count: reviews.length }
}

// Quem ainda não tem avaliação entra com esta nota, para não sumir das sugestões.
const NEUTRAL_RATING = 4

// Mistura nota e proximidade: uma nota alta compensa alguns quilômetros a mais.
export function recommend(items, kind, storedReviews) {
  return items
    .map((item) => {
      const { average, count } = ratingSummary(reviewsOf(item, kind, storedReviews))
      return { ...item, score: (count ? average : NEUTRAL_RATING) - item.distance * 0.15 }
    })
    .sort((a, b) => b.score - a.score)
}
