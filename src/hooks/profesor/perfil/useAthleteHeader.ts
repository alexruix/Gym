import { useState, useEffect, useRef, useMemo } from "react";

/**
 * useAthleteHeader: Hook para manejar la lógica de scroll, medición y métricas del header.
 */
export function useAthleteHeader(alumno: any, headerCopy: any) {
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measureHeight = () => {
      if (headerRef.current && !isSticky) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    measureHeight();
    const handleScroll = () => setIsSticky(window.scrollY > 120);
    const handleResize = measureHeight;

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isSticky]);

  const lastSessionText = useMemo(() => {
    if (!alumno.ultima_sesion) return headerCopy.metrics.never;
    const last = new Date(alumno.ultima_sesion);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return headerCopy.metrics.today;
    if (diffDays === 1) return headerCopy.metrics.yesterday;
    return headerCopy.metrics.daysAgo.replace("{n}", diffDays.toString());
  }, [alumno.ultima_sesion, headerCopy.metrics]);

  return {
    isSticky,
    headerHeight,
    headerRef,
    lastSessionText
  };
}
