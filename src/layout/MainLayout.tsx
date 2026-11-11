
import { NavLink, Outlet } from "react-router-dom";
import { Activity, ClipboardList, Database, LayoutDashboard } from "lucide-react";

import img_mef from "../assets/layout/mef_logo.png";

export function MainLayout(){

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b border-border bg-white/90 shadow-sm backdrop-blur">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft p-2">
                            <img className="h-full w-full object-contain" src={img_mef} alt="MEF" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Plataforma MEF</p>
                            <p className="text-sm text-muted">Gestión presupuestal y auditoría</p>
                        </div>
                    </div>
                    <nav className="flex flex-wrap items-center gap-1 rounded-2xl bg-bg p-1">
                        <NavLink className={({isActive}) => `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-white text-accent shadow-sm" : "text-text-main hover:text-text-h"}`} to={"/"}>
                            <LayoutDashboard size={16} /> Inicio
                        </NavLink>
                        <NavLink className={({isActive}) => `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-white text-accent shadow-sm" : "text-text-main hover:text-text-h"}`} to={"/Registros"}>
                            <Database size={16} /> Registros
                        </NavLink>
                        <NavLink className={({isActive}) => `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-white text-accent shadow-sm" : "text-text-main hover:text-text-h"}`} to={"/Auditoria"}>
                            <Activity size={16} /> Auditoría
                        </NavLink>
                        <NavLink className={({isActive}) => `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-white text-accent shadow-sm" : "text-text-main hover:text-text-h"}`} to={"/Carga"}>
                            <ClipboardList size={16} /> Carga
                        </NavLink>
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                <Outlet/>
            </main>
            <footer className="border-t border-border bg-white/70 px-5 py-5 text-center text-xs text-muted">
                Sistema de gestión presupuestal · MEF
            </footer>
        </div>
    );

}