#ifndef TREE_SITTER_ISA_H_
#define TREE_SITTER_ISA_H_

typedef struct TSLanguage TSLanguage;

#ifdef __cplusplus
extern "C" {
#endif

const TSLanguage *tree_sitter_isa(void);

#ifdef __cplusplus
}
#endif

#endif // TREE_SITTER_ISA_H_
