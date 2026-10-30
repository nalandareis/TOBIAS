export const MAX_ZOOM = 15

const pawSvg =
  '<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><ellipse cx="16" cy="43" rx="10.5" ry="13"/><ellipse cx="38" cy="21" rx="11.5" ry="16"/><ellipse cx="66" cy="27" rx="11.5" ry="15.5"/><ellipse cx="86" cy="51" rx="10" ry="12.5"/><path d="M48 45c17 0 31 19 31 36 0 12-11 18-21 14-9-4-14-5-24-3-13 2-21-7-17-20 4-15 16-27 31-27Z"/></svg>'

export const pinHtml = (selected) =>
  `<span class="pin${selected ? ' is-selected' : ''}">${pawSvg}</span>`

export const originHtml = '<span class="origin-dot"></span>'
