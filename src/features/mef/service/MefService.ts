import { api } from "../../../services/ApiService"
import type { PaginationQuery, PaginationResponse } from "../../../types/pagination";
import type { GastoPresupuestalFilter, GastoPresupuestalFullResponse, GastoPresupuestalResponse, TiempoOptions } from "../type/MefTypes"


export const MefService = {

    getById : async (id : number) : Promise<GastoPresupuestalFullResponse> => {
        const response = await api.get(
            "mef/" + id
        );
        return response.data;
    },
    
    getAll : async(query: PaginationQuery, filter: GastoPresupuestalFilter) : Promise<PaginationResponse<GastoPresupuestalResponse>> => {
        const response = await api.get(
            "mef",
            {params: {
                ...query,
                ...filter
            }}
        )
        return response.data;
    }
    ,
    getTiempoOptions: async (): Promise<TiempoOptions> => {
        const response = await api.get("mef/tiempos");
        return response.data;
    }

}