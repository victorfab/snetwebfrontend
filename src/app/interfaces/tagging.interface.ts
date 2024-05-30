export interface Tag {
    tag_tipoSitio: string,
    tag_idiomaPagina: string,
    tag_canalBanco: string;
    tag_section: string; //section* 
    tag_subsection1: string; //subsection1* 
    tag_subsection2: string;
    tag_subsection3: string;
    tag_titulo: string; //pagename 
    tag_url: string; //URL amigable
    tag_versionApp: number[];// Se debe colocar la versión de la aplicacion.
    tag_marcaDispositivo: string[],// Se colocar la marca del dispositivo.
    tag_Sistema_operativo: string[];
    tag_tipoDispositivo: string[];
    tag_userId: string[] // Se debe colocar el user id homologado.
    tag_aclaracion: string[];
    tag_tipoDeTarjeta: string[],
    tag_procedencia: string[];
    tag_proceso?: string[];
    tag_tipoUsuario?: string;
    event: string;
    tag_entorno?: string;

}

export interface TagEvent {
    event: string;
    interaction_category: string;
    interaction_action: string;
    interaction_label: string;
    interaction_url?: string;
    interaction_tipoUsuario?: string
}
