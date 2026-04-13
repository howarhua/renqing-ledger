/**
 * 个人中心页面
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ArrowLeft, Phone, Lock, LogOut, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

// 头像背景色列表
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

// 根据首字母计算背景色
function getAvatarColor(username: string): string {
  const firstChar = username.charAt(0).toUpperCase();
  const codePoint = firstChar.codePointAt(0) || 0;
  return AVATAR_COLORS[codePoint % AVATAR_COLORS.length];
}

// 获取首字母
function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword } = useAuthStore();

  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  // 处理手机号保存
  const handlePhoneSave = async () => {
    if (!phone) {
      setPhoneError('请输入手机号');
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      setPhoneError('请输入正确的11位手机号');
      return;
    }
    setPhoneError('');
    setLoading(true);
    try {
      await updateProfile(phone);
      setIsEditingPhone(false);
    } catch (err: any) {
      setPhoneError(err.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理取消编辑手机号
  const handlePhoneCancel = () => {
    setPhone(user?.phone || '');
    setPhoneError('');
    setIsEditingPhone(false);
  };

  // 处理修改密码
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('新密码至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess('密码修改成功');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || '原密码错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">请先登录</p>
      </div>
    );
  }

  const avatarColor = getAvatarColor(user.username);
  const initial = getInitial(user.username);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/40">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold">个人中心</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 用户信息卡片 */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 text-2xl font-bold" style={{ backgroundColor: avatarColor }}>
                <AvatarFallback className="text-2xl font-bold" style={{ backgroundColor: avatarColor, color: 'white' }}>
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-xl break-all">{user.username}</CardTitle>
                <CardDescription>加入于 {new Date(user.created_at).toLocaleDateString()}</CardDescription>
                {user.last_login_at && (
                  <CardDescription>最近登录 {new Date(user.last_login_at).toLocaleString()}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 手机号设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4" />
              手机号
            </CardTitle>
            <CardDescription>用于接收重要通知</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {isEditingPhone ? (
                  <div className="space-y-2">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setPhoneError('');
                      }}
                      placeholder="请输入11位手机号"
                      maxLength={11}
                      className={cn(phoneError && 'border-destructive')}
                    />
                    {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
                  </div>
                ) : (
                  <p className="text-foreground">{phone || '未设置'}</p>
                )}
              </div>
              {isEditingPhone ? (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={handlePhoneCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handlePhoneSave} disabled={loading}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingPhone(true)}>
                  {phone ? '修改' : '添加'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 修改密码 */}
        <Card>
          <CardHeader>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full flex items-center justify-between cursor-pointer hover:opacity-80"
            >
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4" />
                修改密码
              </CardTitle>
              {showPasswordForm ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <CardDescription>定期更换密码可保护账户安全</CardDescription>
          </CardHeader>
          {showPasswordForm && (
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password">原密码</Label>
                  <Input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="请输入原密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少6位）"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                  />
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
                <Button type="submit" variant="outline" className="w-full" disabled={loading}>
                  {loading ? '处理中...' : '确认修改'}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* 退出登录 */}
        <Card>
          <CardContent className="pt-6">
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* 底部信息 */}
      <footer className="py-6 text-center text-sm text-muted-foreground space-y-2">
        <p>© 2024 人情簿 All Rights Reserved</p>
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="hover:text-foreground">用户协议</a>
          <span>·</span>
          <a href="#" className="hover:text-foreground">隐私政策</a>
        </div>
      </footer>
    </div>
  );
}
