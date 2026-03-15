import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  role?: string;
}

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Admin",
  professional: "Barbeiro",
  receptionist: "Recepção",
  master: "Master",
};

export default function MasterUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id, user_id, full_name, phone"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const roleMap = new Map(rolesRes.data?.map((r) => [r.user_id, r.role]) || []);
      const merged = (profilesRes.data || []).map((p) => ({
        ...p,
        role: roleMap.get(p.user_id) || "owner",
      }));

      setUsers(merged);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários da Plataforma</h1>
        <p className="text-muted-foreground text-sm">Todos os perfis registrados no CutFlow.</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Função</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "master" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                        {roleLabels[u.role || ""] || u.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
