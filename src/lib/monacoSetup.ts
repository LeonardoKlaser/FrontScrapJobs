// Setup local do Monaco editor — bypassa o loader CDN do @monaco-editor/react
// (que tentava buscar https://cdn.jsdelivr.net/.../monaco-editor/min/vs/...).
// O CSP de produção (nginx.conf) não permite cdn.jsdelivr.net em script-src
// nem worker-src, então o editor abriria em branco em prod. Aqui registramos
// o monaco bundlado pelo Vite no chunk vendor-monaco e configuramos os
// workers via ?worker (Vite empacota em /assets — same-origin, OK pro CSP
// 'self' do worker-src).
//
// Importar este módulo em qualquer ponto antes do <Editor> renderizar é
// suficiente — loader.config + MonacoEnvironment são side-effects globais.
import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    return new editorWorker()
  }
}

loader.config({ monaco })
