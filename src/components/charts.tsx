"use client";

import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityPoint, LanguageShare } from "@/domain/github";

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" };

export const ActivityChart = ({ data }: { data: ActivityPoint[] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart data={data} margin={{ left: -20, right: 8, top: 10 }}>
      <defs><linearGradient id="activity" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7c6cff" stopOpacity={0.45} /><stop offset="1" stopColor="#7c6cff" stopOpacity={0} /></linearGradient></defs>
      <CartesianGrid stroke="var(--border)" vertical={false} />
      <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={tooltipStyle} />
      <Area type="monotone" dataKey="contributions" stroke="#7c6cff" strokeWidth={2.5} fill="url(#activity)" />
      <Area type="monotone" dataKey="commits" stroke="#43c6db" strokeWidth={2} fill="transparent" />
    </AreaChart>
  </ResponsiveContainer>
);

export const LanguageChart = ({ data }: { data: LanguageShare[] }) => (
  <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
    <ResponsiveContainer width="100%" height={180}>
      <PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={4} stroke="none">{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
    </ResponsiveContainer>
    <div className="space-y-3">{data.map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><i className="size-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div>)}</div>
  </div>
);
