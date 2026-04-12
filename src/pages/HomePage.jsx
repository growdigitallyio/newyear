import React, { useEffect, useMemo, useState } from 'react'
import nakathDetails from '../assets/nakath'
import kokis from '../assets/kokis.png'
import kaum from '../assets/kaum.png'
import kiribath from '../assets/kiribath.png'

const sinhalaMonthMap = {
  ජනවාරි: 0,
  පෙබරවාරි: 1,
  මාර්තු: 2,
  අප්‍රේල්: 3,
  මැයි: 4,
  ජූනි: 5,
  ජූලි: 6,
  අගෝස්තු: 7,
  සැප්තැම්බර්: 8,
  ඔක්තෝබර්: 9,
  නොවැම්බර්: 10,
  දෙසැම්බර්: 11,
}

const parseDateParts = (dateText) => {
  const match = dateText.match(/(\d{4})\s+([^\s]+)\s+(\d{1,2})/)
  if (!match) return null

  const year = Number(match[1])
  const monthName = match[2]
  const day = Number(match[3])
  const month = sinhalaMonthMap[monthName]

  if (Number.isNaN(year) || Number.isNaN(day) || month === undefined) return null
  return { year, month, day }
}

const parseTimeMatches = (timeText) => {
  const regex = /(පූර්වභාග|අපරභාග)\s*(\d{1,2})\.(\d{2})/g
  const matches = []
  let match = regex.exec(timeText)

  while (match) {
    const period = match[1]
    const rawHour = Number(match[2])
    const minute = Number(match[3])
    let hour = rawHour

    if (period === 'පූර්වභාග' && rawHour === 12) hour = 0
    if (period === 'අපරභාග' && rawHour < 12) hour = rawHour + 12

    matches.push({ hour, minute })
    match = regex.exec(timeText)
  }

  return matches
}

const fallingKavili = [
  {
    alt: 'කැවුම්',
    src: kaum,
    left: '6%',
    size: '50px',
    duration: '11s',
    delay: '0s',
    drift: '-90px',
    rotate: '-18deg',
  },
  {
    alt: 'කොකිස්',
    src: kokis,
    left: '14%',
    size: '50px',
    duration: '13s',
    delay: '1.5s',
    drift: '75px',
    rotate: '12deg',
  },
  {
    alt: 'අලුවා',
    src: kiribath,
    left: '24%',
    size: '58px',
    duration: '12s',
    delay: '3.3s',
    drift: '-60px',
    rotate: '-10deg',
  },
  {
    alt: 'කැවුම්',
    src: kaum,
    left: '36%',
    size: '50px',
    duration: '14s',
    delay: '2.1s',
    drift: '55px',
    rotate: '9deg',
  },
  {
    alt: 'කොකිස්',
    src: kokis,
    left: '48%',
    size: '50px',
    duration: '10.5s',
    delay: '0.8s',
    drift: '-70px',
    rotate: '-12deg',
  },
  {
    alt: 'අලුවා',
    src: kiribath,
    left: '59%',
    size: '58px',
    duration: '12.8s',
    delay: '4.1s',
    drift: '95px',
    rotate: '14deg',
  },
  {
    alt: 'කැවුම්',
    src: kaum,
    left: '71%',
    size: '50px',
    duration: '11.6s',
    delay: '2.7s',
    drift: '-65px',
    rotate: '-16deg',
  },
  {
    alt: 'කොකිස්',
    src: kokis,
    left: '83%',
    size: '50px',
    duration: '13.5s',
    delay: '1.2s',
    drift: '85px',
    rotate: '11deg',
  },
  {
    alt: 'අලුවා',
    src: kiribath,
    left: '92%',
    size: '58px',
    duration: '10.8s',
    delay: '3.8s',
    drift: '-72px',
    rotate: '-13deg',
  },
]

const HomePage = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const parsedNakath = useMemo(() => {
    return nakathDetails.map((item, index) => {
      const dateParts = parseDateParts(item.Date)
      const parsedTimes = dateParts ? parseTimeMatches(item.Time) : []

      const allTimes = parsedTimes.map(({ hour, minute }) => {
        return new Date(dateParts.year, dateParts.month, dateParts.day, hour, minute, 0, 0)
      })

      const startTime = allTimes[0] ?? null
      const endTime = item.Time.includes('අවසානය') && allTimes.length > 1 ? allTimes[1] : null

      return {
        ...item,
        index,
        startTime,
        endTime,
        allTimes,
      }
    })
  }, [])

  const timePoints = useMemo(() => {
    return parsedNakath
      .flatMap((item) => item.allTimes.map((point) => ({ index: item.index, time: point })))
      .sort((a, b) => a.time - b.time)
  }, [parsedNakath])

  const nextPoint = useMemo(() => {
    return timePoints.find((point) => point.time > now) ?? null
  }, [timePoints, now])

  const currentNakathIndex = useMemo(() => {
    let activeIndex = -1

    parsedNakath.forEach((item) => {
      if (!item.startTime) return

      let effectiveEnd = item.endTime
      if (!effectiveEnd) {
        const nextAfterStart = timePoints.find((point) => point.time > item.startTime)
        effectiveEnd = nextAfterStart?.time ?? null
      }

      if (now >= item.startTime && (!effectiveEnd || now < effectiveEnd)) {
        activeIndex = item.index
      }
    })

    return activeIndex
  }, [parsedNakath, timePoints, now])

  const countdown = useMemo(() => {
    if (!nextPoint) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' }
    }

    const totalSeconds = Math.max(0, Math.floor((nextPoint.time.getTime() - now.getTime()) / 1000))
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    }
  }, [nextPoint, now])

  const nextNakath = nextPoint ? parsedNakath[nextPoint.index] : null

  return (
    <div className="dark">
      <div className="text-on-surface overflow-x-hidden">
        <div className="falling-kavili-layer" aria-hidden="true">
          {fallingKavili.map((item, index) => (
            <img
              key={`${item.alt}-${index}`}
              src={item.src}
              alt={item.alt}
              className="falling-kavili"
              style={{
                left: item.left,
                width: item.size,
                height: item.size,
                animationDuration: item.duration,
                animationDelay: item.delay,
                transform: `rotate(${item.rotate})`,
                '--drift': item.drift,
              }}
            />
          ))}
        </div>

        {/* TopAppBar */}
        <header className="w-full absolute top-0 z-50 bg-transparent">
          <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
            <div className="text-2xl font-serif text-[#e9c349] drop-shadow-sm italic">නැකත් වේලාවන් 2026</div>
            <div className="hidden md:flex space-x-12">
              <a className="text-[#e9c349] border-b border-[#e9c349]/30 font-sans tracking-widest uppercase text-xs" href="#">
                සුබ වේලාවන්
              </a>
              <a className="text-white/70 hover:text-[#e9c349] transition-colors font-sans tracking-widest uppercase text-xs" href="#">
                සම්ප්‍රදායන්
              </a>
              <a className="text-white/70 hover:text-[#e9c349] transition-colors font-sans tracking-widest uppercase text-xs" href="#">
                ඡායාරූප
              </a>
            </div>
            <div className="flex space-x-6 text-[#e9c349]">
              <span className="material-symbols-outlined cursor-pointer hover:scale-95 duration-300" data-icon="calendar_today">
                calendar_today
              </span>
              <span className="material-symbols-outlined cursor-pointer hover:scale-95 duration-300" data-icon="share">
                share
              </span>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden hero-gradient">
          <div className="absolute inset-0 subtle-pattern pointer-events-none"></div>

          {/* Decorative Background Elements */}
          <div className="absolute top-20 -left-10 opacity-10 blur-sm pointer-events-none w-64 h-64 rotate-12">
            <img
              className="w-full h-full object-contain"
              data-alt="මඳ ආලෝකයෙන් සැරසූ අඳුරු පසුබිමක සම්ප්‍රදායික ශ්‍රී ලාංකික කැවුම්"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApApgb_tqkAPtznY1jr8j6Zd-9q9bioi5VSSnKZWH0jp9WCtySDuJLQRP3XIs1JoFY0HDpLM8tucGL5I5v4AGIlEdt8ORQSX7FDoDoeJdJkd8AXUCYDE-9bKwh92fetPJDpfiXNur-R7-AzazP4WRahAoX7Td9qtZ3QCVIp5CBjYAV25R4sJvPNz95dpncKFXvIcz2h9T6c2Je0dG_B7JudWGQMRDY0inL2f8zWeSp_W2UxuRo2pCl9rkFmZO4JiOqyjJVWU7tQR03"
            />
          </div>
          <div className="absolute bottom-20 -right-10 opacity-10 blur-sm pointer-events-none w-72 h-72 -rotate-12">
            <img
              className="w-full h-full object-contain"
              data-alt="උත්සවීය ආලෝකයෙන් හැඩවූ සම්ප්‍රදායික රන්වන් කොකිස්"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABoXsud2_ipCP0wXD7fqYA0ss8Isox-ZCgz7nCGfPVeT-fjLakKMYYsy-HcnlSkHcAq6UCd7TI3kw-gDggXL9GuvcZZgi422PMHOdAvrfJ4bydlOizniZPWz38REMIlViH9XmB_K8DtkCncUzIz8XDkq5Nm1hx36yA3WKyfNGiABHG-IaQIflJa-sD9obZ93UUBYNHI4fYu9t2s8wXWL3TXeLny-19oaJv_1kkirt7M3_C_52TZlRV69xICIW150VdbCzQ9XCgaNoQ"
            />
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="font-headline font-bold italic text-4xl md:text-7xl mb-4 text-[#e9c349] tracking-tight leading-30">සුභ අලුත් අවුරුද්දක් වේවා 2026</h1>
            <p className="font-label uppercase tracking-[0.4em] text-sm text-secondary mb-16 opacity-80">විශේෂ උත්සව සංස්කරණය</p>

            {/* Countdown Container */}
            <div className="glass-panel border border-secondary/15 rounded-xl p-12 mb-20 relative overflow-hidden group transition-all duration-500 hover:border-secondary/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary/20 to-transparent"></div>
              <h2 className="font-label font-bold uppercase tracking-widest text-lg text-secondary/70 mb-8">
                මීළඟ නැකත: {nextNakath ? nextNakath.nakatha : 'මෙම වසරේ නැකත් අවසන්'}
              </h2>
              <div className="flex justify-center gap-4 md:gap-12 items-baseline">
                <div className="flex flex-col">
                  <span className="font-headline text-5xl md:text-8xl text-secondary gold-glow">{countdown.days}</span>
                  <span className="font-label text-[10px] tracking-widest uppercase mt-2 opacity-60">දින</span>
                </div>
                <span className="font-headline text-4xl md:text-6xl text-secondary/30 self-start mt-2">:</span>
                <div className="flex flex-col">
                  <span className="font-headline text-5xl md:text-8xl text-secondary gold-glow">{countdown.hours}</span>
                  <span className="font-label text-[10px] tracking-widest uppercase mt-2 opacity-60">පැය</span>
                </div>
                <span className="font-headline text-4xl md:text-6xl text-secondary/30 self-start mt-2">:</span>
                <div className="flex flex-col">
                  <span className="font-headline text-5xl md:text-8xl text-secondary gold-glow">{countdown.minutes}</span>
                  <span className="font-label text-[10px] tracking-widest uppercase mt-2 opacity-60">මිනිත්තු</span>
                </div>
                <span className="font-headline text-4xl md:text-6xl text-secondary/30 self-start mt-2">:</span>
                <div className="flex flex-col">
                  <span className="font-headline text-5xl md:text-8xl text-secondary gold-glow">{countdown.seconds}</span>
                  <span className="font-label text-[10px] tracking-widest uppercase mt-2 opacity-60">තත්පර</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 opacity-80">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" data-icon="location_on">
                  location_on
                </span>
                <span className="font-label text-[10px] tracking-widest uppercase">කොළඹ, ශ්‍රී ලංකා මානක වේලාව</span>
              </div>
              <div className="w-px h-4 bg-secondary/20 hidden md:block"></div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" data-icon="auto_awesome">
                  auto_awesome
                </span>
                <span className="font-label text-[10px] tracking-widest uppercase">සූර්යයා මේෂ රාශියට පිවිසීම</span>
              </div>
            </div>
          </div>
          <div className="absolute top-1/4 -right-12 opacity-[0.05] blur-[2px] pointer-events-none w-56 h-56 rotate-25deg z-0">
            <img
              alt="සම්ප්‍රදායික ශ්‍රී ලාංකික අලුවා"
              className="w-full h-full object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApApgb_tqkAPtznY1jr8j6Zd-9q9bioi5VSSnKZWH0jp9WCtySDuJLQRP3XIs1JoFY0HDpLM8tucGL5I5v4AGIlEdt8ORQSX7FDoDoeJdJkd8AXUCYDE-9bKwh92fetPJDpfiXNur-R7-AzazP4WRahAoX7Td9qtZ3QCVIp5CBjYAV25R4sJvPNz95dpncKFXvIcz2h9T6c2Je0dG_B7JudWGQMRDY0inL2f8zWeSp_W2UxuRo2pCl9rkFmZO4JiOqyjJVWU7tQR03"
            />
          </div>
          <div className="absolute bottom-1/4 -left-16 opacity-[0.07] blur-[3px] pointer-events-none w-64 h-64 -rotate-15deg z-0">
            <img
              alt="සම්ප්‍රදායික ශ්‍රී ලාංකික කොකිස්"
              className="w-full h-full object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABoXsud2_ipCP0wXD7fqYA0ss8Isox-ZCgz7nCGfPVeT-fjLakKMYYsy-HcnlSkHcAq6UCd7TI3kw-gDggXL9GuvcZZgi422PMHOdAvrfJ4bydlOizniZPWz38REMIlViH9XmB_K8DtkCncUzIz8XDkq5Nm1hx36yA3WKyfNGiABHG-IaQIflJa-sD9obZ93UUBYNHI4fYu9t2s8wXWL3TXeLny-19oaJv_1kkirt7M3_C_52TZlRV69xICIW150VdbCzQ9XCgaNoQ"
            />
          </div>
          <div className="absolute top-10 right-1/4 opacity-[0.04] blur-[4px] pointer-events-none w-48 h-48 rotate-[-10deg] z-0">
            <img
              alt="සම්ප්‍රදායික ශ්‍රී ලාංකික කැවුම්"
              className="w-full h-full object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWOMvbXrfrLL6sqXDisAeqd5cPjYyFRwU0nuxDI7kifk4h48Tkkomk6qdbk7g2wvLNb0j9T1-hPITNRzhLo9fatglp6rRR25XvQBi3Asapt4Q3rJPtveUdodJ3GMdznO7oC6myV1kB5JVvuDi4ZG-0BDtUfPKYDyxAYc1iW2pIYpuP-jqyxIoZPBgARejOCzdWghZt7pKmfCprLdwuXFkzPIUcgbkb2ZWJmSCaluqLNUXgiox7JW8jhXm6phJPjs5Kdpz__FgmMKy7"
            />
          </div>
        </main>

        {/* Nakath Schedule Section */}
        <section className="bg-surface relative py-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-20 gap-4">
              <div>
                <h2 className="font-headline italic text-4xl text-[#e9c349] mb-2">සුබ මොහොත</h2>
                <p className="font-label text-xs tracking-widest uppercase opacity-40">සංස්කෘතික චාරිත්‍ර සඳහා පූජනීය වේලාවන්</p>
              </div>
              <div className="h-px grow bg-secondary/10 mx-8 hidden md:block"></div>
              <button className="font-label text-[10px] tracking-widest uppercase border border-secondary/20 px-6 py-3 rounded-full hover:bg-secondary/10 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" data-icon="download">
                  download
                </span>
                සම්පූර්ණ කාලසටහන
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-hidden rounded-xl border border-secondary/10">
              {nakathDetails.map((item, index) => {
                const isHighlighted = index === currentNakathIndex

                return (
                  <div
                    key={`${item.nakatha}-${index}`}
                    className={
                      isHighlighted
                        ? 'bg-surface-container-highest p-10 flex flex-col justify-between relative group ring-1 ring-secondary/40 shadow-2xl shadow-secondary/5'
                        : 'bg-surface-container-low p-10 flex flex-col justify-between transition-colors hover:bg-surface-container-high group'
                    }
                  >
                    {isHighlighted && (
                      <div className="absolute top-0 right-0 px-4 py-1 bg-secondary text-on-secondary font-label text-[9px] tracking-widest uppercase font-bold">
                        ඉදිරියේදී
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <span className={`font-label text-[10px] tracking-[0.3em] uppercase ${isHighlighted ? 'text-secondary' : 'opacity-40'}`}>
                          {String(index + 1).padStart(2, '0')} / {String(nakathDetails.length).padStart(2, '0')}
                        </span>
                        <span
                          className={`material-symbols-outlined ${
                            isHighlighted ? 'text-secondary' : 'text-secondary/30 group-hover:text-secondary transition-colors'
                          }`}
                          data-icon="event_available"
                        >
                          event_available
                        </span>
                      </div>

                      <h3 className={`font-headline italic text-2xl mb-4 ${isHighlighted ? 'text-white' : 'group-hover:text-secondary transition-colors'}`}>
                        {item.nakatha}
                      </h3>

                      <p className={`font-body text-sm mb-8 leading-relaxed ${isHighlighted ? 'text-on-surface/80' : 'text-on-surface/60'}`}>
                        {item.Instructions}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end gap-4">
                        <span className={`font-label text-[10px] tracking-widest uppercase ${isHighlighted ? 'text-secondary/60' : 'opacity-40'}`}>
                          දිනය
                        </span>
                        <span className={`font-body text-right ${isHighlighted ? 'font-bold text-secondary' : 'font-semibold text-secondary'}`}>
                          {item.Date}
                        </span>
                      </div>

                      <div className={`h-px ${isHighlighted ? 'bg-secondary/30' : 'bg-secondary/10'}`}></div>

                      <div className="flex justify-between items-end gap-4">
                        <span className={`font-label text-[10px] tracking-widest uppercase ${isHighlighted ? 'text-secondary/60' : 'opacity-40'}`}>
                          වේලාව
                        </span>
                        <span className={`font-body text-xs italic text-right ${isHighlighted ? 'text-white' : 'opacity-80'}`}>
                          {item.Time}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Cultural Context Section (Bento Grid Style) */}
        <section className="bg-surface-container-low py-32 px-8 overflow-hidden relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[800px] md:h-[600px]">
              <div className="md:col-span-2 md:row-span-2 bg-surface p-12 rounded-xl border border-secondary/10 flex flex-col justify-end relative overflow-hidden group">
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700"
                  data-alt="උණුසුම් ගෘහ පසුබිමක කිරිබත්, කැවුම් සහ පහන් සමඟ සැරසූ ශ්‍රී ලාංකික අවුරුදු මේසයක්"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM97W3agGogcwqIMG3fhQRaUPiw6BH7Zwt7AEOEt10WET7mJfch_s0zVxABlUy9HHbfSOW-xRDCeI5LDDiQ-eQNXNAzRVtUCq1qNqHjNOsvEgi4aQHMB8H0pkY98DABEOyAFduV7cz7FwvRk9lYhLoHqtFQ6ZbmWVDeydDgttTha-MJlDgH6J3Q7YvRFVfS2BAHWe7CP6rhkJZmmjSeq5JNEistq-UxNYfSWMnp_dAy-b4BkuG13SKMiXAvgcaXwaRxInKvvsihqb4"
                />
                <div className="relative z-10">
                  <h3 className="font-headline italic text-3xl mb-4 text-secondary">එකමුතුවේ උරුමය</h3>
                  <p className="font-body text-sm leading-relaxed text-on-surface/70 max-w-md">
                    ගෝලීය සංයෝජනය සහ පවුල් බැඳීම් අතර, අලුත් අවුරුද්දේදී ශ්‍රී ලාංකිකයන් එක් කරන ගැඹුරු සම්ප්‍රදායන් හඳුනාගන්න.
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 bg-surface-container-highest p-8 rounded-xl border border-secondary/10 flex items-center gap-8 group">
                <div className="w-1/3 h-full rounded-lg overflow-hidden relative">
                  <img
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    data-alt="සිංහල අලුත් අවුරුදු උත්සවයේ සම්ප්‍රදායික පොල්තෙල් පහනක් දැල්වීමේ සමීප දර්ශනය"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDINs6ULvAdUb0L0Fh3jwFhUcmAfVj-Ab2PuzB3GWNZ181d0iOX1OSbGx9z1l7UiTec215wmBVb3c1HzKyRVbw7BplnUEprTlhtYalpAlVBXHSN_J-ZpAYr8imWMPR2KKpR4nAB3WUVeohuqcwghpZPxcePNV90DIiwehSxYG7KcL9SjUQ4canyVCZgz64YIv3OEPmOnkWpA65EbU2Xat5B9qMeqIBWQdFdLcpOY_OYZpMS9xJogPsUVLVibuIzqtVvMERZ4l2m9XU0"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-headline italic text-xl mb-2">පූජනීය චාරිත්‍ර</h4>
                  <p className="font-body text-xs text-on-surface/60">ලිප ගිනි මොළවීමේ සිට පළමු ආහාර වේල දක්වා, සෑම ක්‍රියාවක්ම නැකත් සමඟ ගැළපේ.</p>
                </div>
              </div>
              <div className="bg-surface p-8 rounded-xl border border-secondary/10 flex flex-col justify-center text-center group">
                <span className="font-headline text-4xl text-secondary mb-2">2026</span>
                <span className="font-label text-[10px] tracking-widest uppercase opacity-40">සෞභාග්‍යයේ වසර</span>
              </div>
              <div className="bg-secondary p-8 rounded-xl flex flex-col justify-center text-on-secondary group hover:bg-secondary/90 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-4xl mb-4" data-icon="menu_book">
                  menu_book
                </span>
                <span className="font-label text-[10px] tracking-widest uppercase font-bold">සම්ප්‍රදාය මාර්ගෝපදේශය</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-12 bg-[#15082a] border-t border-[#e9c349]/10">
          <div className="flex flex-col md:flex-row justify-between items-center px-12 opacity-60 max-w-7xl mx-auto">
            <div className="font-sans text-[10px] tracking-tight text-white/40 mb-4 md:mb-0">© 2026 විශේෂ උත්සව සංස්කරණය. සියලු හිමිකම් ඇවිරිණි.</div>
            <div className="flex space-x-12">
              <a className="font-sans text-[10px] tracking-tight text-white/40 hover:text-white transition-opacity uppercase" href="#">
                සංස්කෘතික උරුමය
              </a>
              <a className="font-sans text-[10px] tracking-tight text-white/40 hover:text-white transition-opacity uppercase" href="#">
                අප අමතන්න
              </a>
              <a className="font-sans text-[10px] tracking-tight text-white/40 hover:text-white transition-opacity uppercase" href="#">
                පෞද්ගලිකත්වය
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
