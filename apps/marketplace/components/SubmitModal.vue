<script setup lang="ts">
import type { McpCategory, McpRuntime, SkillCategory } from '~/types'

const model = defineModel<boolean>()

const { submitSkill, submitMcp } = useSubmit()
const toast = useToast()

const submitType = ref<'skill' | 'mcp'>('skill')
const submitting = ref(false)
const submitted = ref(false)

const skillForm = reactive({
  name: '',
  description: '',
  version: '0.1.0',
  author: '',
  tags: '',
  category: 'other' as SkillCategory,
  repository: '',
  allowedTools: '',
})

const mcpForm = reactive({
  name: '',
  description: '',
  version: '0.1.0',
  vendor: '',
  tags: '',
  category: 'other' as McpCategory,
  runtime: 'node' as McpRuntime,
  npmPackage: '',
  sourceUrl: '',
  license: 'MIT',
  command: 'npx',
  args: '',
})

const skillCategories = [
  { label: '开发工具', value: 'development' },
  { label: '写作', value: 'writing' },
  { label: '设计', value: 'design' },
  { label: '自动化', value: 'automation' },
  { label: '数据', value: 'data' },
  { label: 'DevOps', value: 'devops' },
  { label: '测试', value: 'testing' },
  { label: '其他', value: 'other' },
]

const mcpCategories = [
  { label: '文件系统', value: 'filesystem' },
  { label: '数据库', value: 'database' },
  { label: 'API', value: 'api' },
  { label: '浏览器', value: 'browser' },
  { label: 'AI', value: 'ai' },
  { label: '开发工具', value: 'devtools' },
  { label: '通信', value: 'communication' },
  { label: '其他', value: 'other' },
]

const runtimeOptions = [
  { label: 'Node.js', value: 'node' },
  { label: 'Python', value: 'python' },
  { label: 'Docker', value: 'docker' },
  { label: 'Binary', value: 'binary' },
]

function resetForm() {
  Object.assign(skillForm, { name: '', description: '', version: '0.1.0', author: '', tags: '', category: 'other', repository: '', allowedTools: '' })
  Object.assign(mcpForm, { name: '', description: '', version: '0.1.0', vendor: '', tags: '', category: 'other', runtime: 'node', npmPackage: '', sourceUrl: '', license: 'MIT', command: 'npx', args: '' })
  submitted.value = false
}

function handleClose() {
  model.value = false
  setTimeout(resetForm, 300)
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (submitType.value === 'skill') {
      await submitSkill({
        name: skillForm.name,
        description: skillForm.description,
        version: skillForm.version,
        author: skillForm.author,
        tags: skillForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        category: skillForm.category,
        repository: skillForm.repository || undefined,
        allowedTools: skillForm.allowedTools.split(',').map(t => t.trim()).filter(Boolean),
      })
    }
    else {
      await submitMcp({
        name: mcpForm.name,
        description: mcpForm.description,
        version: mcpForm.version,
        vendor: mcpForm.vendor,
        tags: mcpForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        category: mcpForm.category,
        runtime: mcpForm.runtime,
        npmPackage: mcpForm.npmPackage || undefined,
        sourceUrl: mcpForm.sourceUrl || undefined,
        license: mcpForm.license,
        config: { command: mcpForm.command, args: mcpForm.args.split(' ').filter(Boolean) },
      })
    }
    submitted.value = true
    toast.add({ title: '发布成功!', color: 'success' })
  }
  catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '提交失败', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal v-model:open="model" :ui="{ content: 'sm:max-w-lg' }">
    <template #content>
      <!-- Success State -->
      <div v-if="submitted" class="p-6 text-center">
        <div class="size-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <UIcon name="i-lucide-check" class="size-6 text-emerald-400" />
        </div>
        <h3 class="text-base font-semibold text-[--color-text-primary] mb-1">发布成功</h3>
        <p class="text-sm text-[--color-text-secondary] mb-6">已成功添加到市场</p>
        <div class="flex justify-center gap-3">
          <UButton :to="submitType === 'skill' ? '/skills' : '/mcps'" @click="handleClose">
            查看市场
          </UButton>
          <UButton variant="outline" color="neutral" @click="resetForm">
            继续发布
          </UButton>
        </div>
      </div>

      <!-- Form -->
      <div v-else class="flex flex-col h-[600px]">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 pb-4 shrink-0">
          <h3 class="text-base font-semibold text-[--color-text-primary]">发布到市场</h3>
          <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="handleClose" />
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 min-h-0 overflow-y-auto px-5">
          <UTabs
            :items="[{ label: 'Skill', value: 'skill' }, { label: 'MCP Server', value: 'mcp' }]"
            :model-value="submitType"
            class="mb-5"
            @update:model-value="submitType = ($event as 'skill' | 'mcp')"
          />

          <div class="space-y-4">
            <template v-if="submitType === 'skill'">
              <UFormField label="名称" required>
                <UInput v-model="skillForm.name" placeholder="my-skill" class="w-full" />
              </UFormField>
              <UFormField label="版本">
                <UInput v-model="skillForm.version" placeholder="0.1.0" class="w-full" />
              </UFormField>
              <UFormField label="描述" required>
                <UTextarea v-model="skillForm.description" :rows="2" placeholder="Skill 功能描述..." autoresize class="w-full" />
              </UFormField>
              <UFormField label="作者" required>
                <UInput v-model="skillForm.author" placeholder="Author Name" class="w-full" />
              </UFormField>
              <UFormField label="分类">
                <USelect v-model="skillForm.category" :items="skillCategories" class="w-full" />
              </UFormField>
              <UFormField label="标签" description="逗号分隔">
                <UInput v-model="skillForm.tags" placeholder="automation, ai, workflow" class="w-full" />
              </UFormField>
              <UFormField label="允许的工具" description="逗号分隔">
                <UInput v-model="skillForm.allowedTools" placeholder="Bash, Read, Write, Edit" class="w-full" />
              </UFormField>
              <UFormField label="Git 仓库">
                <UInput v-model="skillForm.repository" placeholder="https://github.com/user/repo" icon="i-lucide-github" class="w-full" />
              </UFormField>
            </template>

            <template v-else>
              <UFormField label="包名" required>
                <UInput v-model="mcpForm.name" placeholder="@scope/mcp-server" class="w-full" />
              </UFormField>
              <UFormField label="版本">
                <UInput v-model="mcpForm.version" placeholder="0.1.0" class="w-full" />
              </UFormField>
              <UFormField label="描述" required>
                <UTextarea v-model="mcpForm.description" :rows="2" placeholder="MCP 服务器功能描述..." autoresize class="w-full" />
              </UFormField>
              <UFormField label="开发者" required>
                <UInput v-model="mcpForm.vendor" placeholder="Vendor Name" class="w-full" />
              </UFormField>
              <UFormField label="运行时">
                <USelect v-model="mcpForm.runtime" :items="runtimeOptions" class="w-full" />
              </UFormField>
              <UFormField label="分类">
                <USelect v-model="mcpForm.category" :items="mcpCategories" class="w-full" />
              </UFormField>
              <UFormField label="License">
                <UInput v-model="mcpForm.license" placeholder="MIT" class="w-full" />
              </UFormField>
              <UFormField label="npm 包">
                <UInput v-model="mcpForm.npmPackage" placeholder="@scope/package" class="w-full" />
              </UFormField>
              <UFormField label="标签" description="逗号分隔">
                <UInput v-model="mcpForm.tags" placeholder="api, automation, tools" class="w-full" />
              </UFormField>
              <UFormField label="源码 URL">
                <UInput v-model="mcpForm.sourceUrl" placeholder="https://github.com/..." icon="i-lucide-github" class="w-full" />
              </UFormField>
              <UFormField label="启动命令">
                <UInput v-model="mcpForm.command" placeholder="npx" class="w-full" />
              </UFormField>
              <UFormField label="启动参数" description="空格分隔">
                <UInput v-model="mcpForm.args" placeholder="-y @scope/package" class="w-full" />
              </UFormField>
            </template>
          </div>
        </div>

        <!-- Fixed Footer -->
        <div class="shrink-0 p-4 flex justify-end gap-3">
          <UButton variant="outline" color="neutral" @click="handleClose">
            取消
          </UButton>
          <UButton :loading="submitting" icon="i-lucide-upload" @click="handleSubmit">
            提交发布
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
