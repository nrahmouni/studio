// This file is obsolete and will be replaced by a general login page.
// To avoid breaking references, it redirects. For a clean implementation, this file should be deleted.
import { redirect } from 'next/navigation';

export default function DeprecatedEmpresaLoginPage() {
    redirect('/auth/login');
}
