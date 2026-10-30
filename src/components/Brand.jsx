import logoUrl from '../assets/logo.webp'

export function Logo({ className }) {
  return <img className={className} src={logoUrl} alt="Tobias" width="1000" height="254" />
}

export function PawMark({ size = 96, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <ellipse cx="16" cy="43" rx="10.5" ry="13" transform="rotate(-20 16 43)" />
      <ellipse cx="38" cy="21" rx="11.5" ry="16" transform="rotate(-4 38 21)" />
      <ellipse cx="66" cy="27" rx="11.5" ry="15.5" transform="rotate(13 66 27)" />
      <ellipse cx="86" cy="51" rx="10" ry="12.5" transform="rotate(28 86 51)" />
      <path
        fillRule="evenodd"
        d="M48 45c17 0 31 19 31 36 0 12-11 18-21 14-9-4-14-5-24-3-13 2-21-7-17-20 4-15 16-27 31-27Zm-1 40c-9-7-14-13-13-20 1-5 8-6 12-1 3-6 11-5 12 1 1 7-4 13-11 20Z"
      />
    </svg>
  )
}

// Cachorro e gato da tela de abertura, redesenhados em vetor a partir do layout.
export function PetsIllustration({ className }) {
  return (
    <svg className={className} viewBox="250 62 380 176" role="img" aria-label="Um cachorro e um gato caminhando">
      <g fill="#EDD3A4" stroke="#6E4A2B" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M306 124c-20 1-37-16-36-38 7 13 21 23 40 26z" />
        <path fill="#E2C48F" d="M318 172c1 20 6 38 14 50 4 7-9 9-15 5-11-14-16-34-16-54z" />
        <path fill="#E2C48F" d="M350 176c2 18 7 34 14 46 4 7-9 9-15 5-10-13-15-31-16-50z" />
        <path d="M302 122c15 4 30 4 42-2-6-20 6-48 34-50 16-1 28 10 34 22 8 2 20 4 25 9 4 5-1 13-9 17-8 6-20 10-30 10 0 12-4 24-12 34 6 20 14 42 22 56 6 8 2 12-8 12-8 1-14-2-18-8-10-18-22-32-34-42-12 4-26 2-38-4-8 14-22 32-36 48-6 7-18 7-16 0 4-18 14-38 22-56 4-18 10-34 22-46z" />
        <path fill="#E2C48F" d="M352 96c-12 6-18 26-12 40 6 10 24 4 30-8 6-12 2-28-6-34-4-2-8-1-12 2z" />
        <path d="M534 136c-14 14-20 32-14 50 6 12 6 26 0 36-2 8 10 10 18 6 8-10 12-22 18-32 12 10 24 22 34 32 8 4 20 2 14-6-10-14-16-32-14-52 2-14 4-22 4-30z" />
        <path d="M530 120c-4-18 0-34 8-46 8 4 14 10 18 16 10-4 22-4 30 0 4-6 8-12 14-16 6 14 12 30 10 46-4 18-20 26-42 26-20 0-34-10-38-26z" />
      </g>
      <g fill="#6E4A2B">
        <circle cx="397" cy="98" r="3.4" />
        <ellipse cx="434" cy="104" rx="4.4" ry="3.6" />
        <circle cx="552" cy="117" r="3" />
        <circle cx="590" cy="113" r="3" />
        <path d="M566 124l8-1-4 5z" />
      </g>
      <g fill="none" stroke="#6E4A2B" strokeWidth="2.4" strokeLinecap="round">
        <path d="M420 116c-6 4-12 4-16 2" />
        <path d="M536 124l-12-2M538 132l-11 3M604 118l12-3M604 126l12 2" />
      </g>
      <g fill="#EDD3A4">
        <circle cx="425" cy="171" r="8.5" />
        <circle cx="446" cy="153" r="9" />
        <circle cx="473" cy="153" r="9" />
        <circle cx="494" cy="171" r="8.5" />
        <path d="M460 232c-16-12-28-22-28-34 0-11 13-16 22-10 3 2 5 4 6 6 1-2 3-4 6-6 9-6 22-1 22 10 0 12-12 22-28 34z" />
      </g>
    </svg>
  )
}
