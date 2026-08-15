import React from "react";
import { X, Watch, Smartphone, Bell, CheckCircle2, ArrowRight, Share2, PlusSquare } from "lucide-react";
import { isIOSSafari, isStandalonePWA } from "../utils/notifications";

interface SmartwatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAgain: () => void;
  isEnabled: boolean;
}

export const SmartwatchModal: React.FC<SmartwatchModalProps> = ({
  isOpen,
  onClose,
  onRequestAgain,
  isEnabled,
}) => {
  if (!isOpen) return null;

  const isIOS = isIOSSafari();
  const isPWA = isStandalonePWA();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4 text-cyan-400">
          <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center">
            <Watch size={22} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Notificações no Smartwatch</h3>
            <p className="text-xs text-slate-400">Apple Watch, Galaxy Watch, Wear OS, Garmin, etc.</p>
          </div>
        </div>

        {isEnabled ? (
          <div className="bg-emerald-950/40 border border-emerald-800 rounded-2xl p-4 mb-4 text-center">
            <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-300">Notificações Ativas!</p>
            <p className="text-xs text-slate-300 mt-1">
              Seu celular e seu Smartwatch conectado já receberão a pesquisa capturada automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-300">
            {isIOS && !isPWA ? (
              <div className="bg-amber-950/30 border border-amber-800/80 rounded-2xl p-4 text-amber-200">
                <div className="flex items-center gap-2 font-semibold text-amber-300 mb-2">
                  <Smartphone size={16} /> Como ativar no iPhone / Apple Watch:
                </div>
                <p className="mb-2 leading-relaxed">
                  Por regra de segurança da Apple no iOS, para um site enviar notificações para o relógio, você só precisa adicioná-lo à tela de início uma única vez:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-200 font-medium ml-1">
                  <li>Toque no botão de <strong>Compartilhar</strong> do Safari (<Share2 className="inline w-3.5 h-3.5 mx-0.5" />).</li>
                  <li>Role e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong> (<PlusSquare className="inline w-3.5 h-3.5 mx-0.5" />).</li>
                  <li>Abra o aplicativo pelo novo ícone criado na sua tela inicial e toque no botão do relógio.</li>
                </ol>
              </div>
            ) : (
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <p className="font-medium text-slate-200 mb-2 flex items-center gap-1.5">
                  <Bell size={15} className="text-cyan-400" /> Permissão no Navegador:
                </p>
                <p className="leading-relaxed text-slate-300">
                  Ao clicar em ativar, o navegador perguntará se deseja permitir notificações. Clique em <strong>&quot;Permitir&quot;</strong> para que os avisos sejam enviados para o seu relógio.
                </p>
              </div>
            )}

            {/* Alternative Methods */}
            <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800">
              <p className="font-semibold text-slate-200 mb-1.5 text-xs">✨ Outras opções instantâneas:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• <strong>Fone Bluetooth / AirPods:</strong> Ligue o botão &quot;Voz&quot; no painel para ouvir a palavra sussurrada.</li>
                <li>• <strong>Vibração no Bolso:</strong> Deixe o botão &quot;Vibração&quot; ativo para o celular vibrar no bolso.</li>
                <li>• <strong>Tela Camuflada:</strong> Deixe o celular na mesa em modo Calculadora ou Notas.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="mt-5 flex gap-2">
          {!isEnabled ? (
            <button
              onClick={onRequestAgain}
              className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
            >
              <Bell size={15} />
              Solicitar Permissão Agora
            </button>
          ) : (
            <button
              onClick={onRequestAgain}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Desativar Notificações
            </button>
          )}
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
