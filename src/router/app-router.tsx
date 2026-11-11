import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";
import { RegistrosPages } from "../features/mef/pages/Registros";
import { Home } from "../pages/Home";
import { AuditoriaPage } from "../features/auditoria/pages/Auditoria";
import { CargaPage } from "../features/carga/pages/Carga";

export function AppRouter(){

    return (
        <>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/Registros" element={<RegistrosPages/>}/>
                    <Route path="/Auditoria" element={<AuditoriaPage/>}/>
                    <Route path="/Carga" element={<CargaPage/>}/>
                </Route>
            </Routes>
        </>
    )
}