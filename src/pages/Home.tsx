
import { Activity, ArrowRight, Database, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Home(){

    return (
        <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-accent">Panel de control</p>
                    <h1 className="mb-5 max-w-2xl text-4xl font-bold leading-tight text-text-h sm:text-5xl">
                        Información pública, clara y bajo control.
                    </h1>
                    <p className="mb-8 max-w-xl text-lg leading-relaxed text-text-main">
                        Consulta registros presupuestales y revisa la trazabilidad de cada ejecución desde un solo lugar.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/Registros" className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/20 hover:bg-[#09626d]">
                            Explorar registros <ArrowRight size={18} />
                        </Link>
                        <Link to="/Auditoria" className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 font-semibold text-text-h hover:bg-accent-soft">
                            Ver auditoría
                        </Link>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-3xl bg-[#123242] p-7 text-white shadow-2xl">
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
                    <div className="relative space-y-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#7de1dc]">
                            <ShieldCheck size={30} />
                        </div>
                        <div>
                            <h2 className="mb-2 text-2xl font-bold text-white">Gestión confiable</h2>
                            <p className="text-sm leading-relaxed text-white/70">Datos organizados, procesos visibles y decisiones respaldadas por información.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                                <Database className="mb-3 text-[#7de1dc]" size={20} />
                                <p className="text-sm font-semibold">Registros</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                                <Activity className="mb-3 text-[#7de1dc]" size={20} />
                                <p className="text-sm font-semibold">Auditoría</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

}